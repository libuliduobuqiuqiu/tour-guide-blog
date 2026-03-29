package service

import (
	"crypto/sha1"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/viper"
)

const (
	socialSettingsKey = "social_settings"
	socialFeedKey     = "social_feed_cache"
)

type SocialPlatformSettings struct {
	Username     string `json:"username"`
	ProfileURL   string `json:"profile_url"`
	PostLimit    int    `json:"post_limit"`
	AccountID    string `json:"account_id"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RedirectURI  string `json:"redirect_uri"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type SocialAdminSettings struct {
	Instagram SocialPlatformSettings `json:"instagram"`
	TikTok    SocialPlatformSettings `json:"tiktok"`
}

type SocialFeedItem struct {
	ID           string `json:"id"`
	Platform     string `json:"platform"`
	Caption      string `json:"caption"`
	Permalink    string `json:"permalink"`
	MediaType    string `json:"media_type"`
	MediaURL     string `json:"media_url"`
	ThumbnailURL string `json:"thumbnail_url"`
	Timestamp    string `json:"timestamp"`
}

type SocialFeedCache struct {
	Instagram    []SocialFeedItem `json:"instagram"`
	TikTok       []SocialFeedItem `json:"tiktok"`
	LastSyncAt   string           `json:"last_sync_at"`
	LastError    string           `json:"last_error"`
	LastPlatform string           `json:"last_platform"`
}

type SocialPlatformStatus struct {
	Configured    bool   `json:"configured"`
	Connected     bool   `json:"connected"`
	Username      string `json:"username"`
	ItemCount     int    `json:"item_count"`
	LastSyncAt    string `json:"last_sync_at"`
	LastSyncError string `json:"last_sync_error"`
}

type SocialStatus struct {
	Instagram SocialPlatformStatus `json:"instagram"`
	TikTok    SocialPlatformStatus `json:"tiktok"`
}

type SocialPublicFeed struct {
	Instagram []SocialFeedItem `json:"instagram"`
	TikTok    []SocialFeedItem `json:"tiktok"`
}

type SocialService struct{}

var Social = &SocialService{}

func (s *SocialService) GetAdminSettings() (*SocialAdminSettings, error) {
	settings := &SocialAdminSettings{}
	if err := s.readConfigJSON(socialSettingsKey, settings); err != nil {
		return settings, nil
	}
	return settings, nil
}

func (s *SocialService) UpdateAdminSettings(settings *SocialAdminSettings) error {
	s.normalizeSettings(settings)
	return s.writeConfigJSON(socialSettingsKey, settings)
}

func (s *SocialService) GetPublicFeed() (*SocialPublicFeed, error) {
	cache, _ := s.getFeedCache()
	return &SocialPublicFeed{
		Instagram: cache.Instagram,
		TikTok:    cache.TikTok,
	}, nil
}

func (s *SocialService) GetStatus() (*SocialStatus, error) {
	settings, _ := s.GetAdminSettings()
	cache, _ := s.getFeedCache()

	return &SocialStatus{
		Instagram: SocialPlatformStatus{
			Configured:    isPlatformConfigured(settings.Instagram),
			Connected:     settings.Instagram.AccessToken != "" || settings.Instagram.ProfileURL != "",
			Username:      settings.Instagram.Username,
			ItemCount:     len(cache.Instagram),
			LastSyncAt:    cache.LastSyncAt,
			LastSyncError: selectPlatformError(cache, "instagram"),
		},
		TikTok: SocialPlatformStatus{
			Configured:    isPlatformConfigured(settings.TikTok),
			Connected:     settings.TikTok.AccessToken != "" || settings.TikTok.ProfileURL != "",
			Username:      settings.TikTok.Username,
			ItemCount:     len(cache.TikTok),
			LastSyncAt:    cache.LastSyncAt,
			LastSyncError: selectPlatformError(cache, "tiktok"),
		},
	}, nil
}

func (s *SocialService) Sync(platform string) error {
	settings, _ := s.GetAdminSettings()
	cache, _ := s.getFeedCache()

	nextInstagram := cache.Instagram
	nextTikTok := cache.TikTok
	var err error
	switch platform {
	case "instagram":
		nextInstagram, err = s.syncInstagram(settings.Instagram)
	case "tiktok":
		nextTikTok, err = s.syncTikTok(settings.TikTok)
	case "all":
		nextInstagram, err = s.syncInstagram(settings.Instagram)
		if err == nil {
			nextTikTok, err = s.syncTikTok(settings.TikTok)
		}
	default:
		return errors.New("unsupported platform")
	}

	cache.LastPlatform = platform
	cache.LastSyncAt = time.Now().UTC().Format(time.RFC3339)
	if err != nil {
		cache.LastError = fmt.Sprintf("%s: %s", platform, err.Error())
		_ = s.writeConfigJSON(socialFeedKey, cache)
		return err
	}

	cache.Instagram = nextInstagram
	cache.TikTok = nextTikTok
	cache.LastError = ""
	return s.writeConfigJSON(socialFeedKey, cache)
}

func (s *SocialService) syncInstagram(settings SocialPlatformSettings) ([]SocialFeedItem, error) {
	if settings.AccessToken == "" || settings.AccountID == "" {
		return s.syncInstagramPublic(settings)
	}

	if settings.AccountID == "" {
		return nil, errors.New("instagram account id is required")
	}
	if settings.AccessToken == "" {
		return nil, errors.New("instagram access token is required")
	}

	params := url.Values{}
	params.Set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp")
	params.Set("limit", "12")
	params.Set("access_token", settings.AccessToken)

	endpoint := fmt.Sprintf("https://graph.facebook.com/v23.0/%s/media?%s", url.PathEscape(settings.AccountID), params.Encode())
	var response struct {
		Data []struct {
			ID           string `json:"id"`
			Caption      string `json:"caption"`
			MediaType    string `json:"media_type"`
			MediaURL     string `json:"media_url"`
			ThumbnailURL string `json:"thumbnail_url"`
			Permalink    string `json:"permalink"`
			Timestamp    string `json:"timestamp"`
		} `json:"data"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	if err := fetchJSON(endpoint, &response); err != nil {
		return nil, err
	}
	if response.Error != nil {
		return nil, errors.New(response.Error.Message)
	}

	items := make([]SocialFeedItem, 0, len(response.Data))
	for _, item := range response.Data {
		mediaURL := item.MediaURL
		if mediaURL == "" {
			mediaURL = item.ThumbnailURL
		}
		items = append(items, SocialFeedItem{
			ID:           item.ID,
			Platform:     "instagram",
			Caption:      item.Caption,
			Permalink:    item.Permalink,
			MediaType:    strings.ToLower(item.MediaType),
			MediaURL:     mediaURL,
			ThumbnailURL: item.ThumbnailURL,
			Timestamp:    item.Timestamp,
		})
	}
	return s.localizeFeedMedia(items)
}

func (s *SocialService) syncTikTok(settings SocialPlatformSettings) ([]SocialFeedItem, error) {
	return s.syncTikTokPublic(settings)
}

func (s *SocialService) getFeedCache() (*SocialFeedCache, error) {
	cache := &SocialFeedCache{}
	if err := s.readConfigJSON(socialFeedKey, cache); err != nil {
		return cache, nil
	}
	return cache, nil
}

func (s *SocialService) normalizeSettings(settings *SocialAdminSettings) {
	settings.Instagram.Username = strings.TrimSpace(settings.Instagram.Username)
	settings.Instagram.ProfileURL = strings.TrimSpace(settings.Instagram.ProfileURL)
	settings.Instagram.AccountID = strings.TrimSpace(settings.Instagram.AccountID)
	settings.Instagram.ClientID = strings.TrimSpace(settings.Instagram.ClientID)
	settings.Instagram.ClientSecret = strings.TrimSpace(settings.Instagram.ClientSecret)
	settings.Instagram.RedirectURI = strings.TrimSpace(settings.Instagram.RedirectURI)
	settings.Instagram.AccessToken = strings.TrimSpace(settings.Instagram.AccessToken)
	settings.Instagram.RefreshToken = strings.TrimSpace(settings.Instagram.RefreshToken)
	settings.Instagram.PostLimit = sanitizePostLimit(settings.Instagram.PostLimit)

	settings.TikTok.Username = strings.TrimSpace(settings.TikTok.Username)
	settings.TikTok.ProfileURL = strings.TrimSpace(settings.TikTok.ProfileURL)
	settings.TikTok.AccountID = strings.TrimSpace(settings.TikTok.AccountID)
	settings.TikTok.ClientID = strings.TrimSpace(settings.TikTok.ClientID)
	settings.TikTok.ClientSecret = strings.TrimSpace(settings.TikTok.ClientSecret)
	settings.TikTok.RedirectURI = strings.TrimSpace(settings.TikTok.RedirectURI)
	settings.TikTok.AccessToken = strings.TrimSpace(settings.TikTok.AccessToken)
	settings.TikTok.RefreshToken = strings.TrimSpace(settings.TikTok.RefreshToken)
	settings.TikTok.PostLimit = sanitizePostLimit(settings.TikTok.PostLimit)

	settings.Instagram.Username = normalizePlatformUsername("instagram", settings.Instagram.ProfileURL, settings.Instagram.Username)
	settings.TikTok.Username = normalizePlatformUsername("tiktok", settings.TikTok.ProfileURL, settings.TikTok.Username)
}

func (s *SocialService) readConfigJSON(key string, dest interface{}) error {
	item, err := Config.GetByKey(key)
	if err != nil {
		return err
	}
	if item.Value == "" {
		return errors.New("empty config")
	}
	return json.Unmarshal([]byte(item.Value), dest)
}

func (s *SocialService) writeConfigJSON(key string, value interface{}) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return Config.Update(key, string(payload))
}

func isPlatformConfigured(settings SocialPlatformSettings) bool {
	return settings.ProfileURL != "" || settings.ClientID != "" || settings.AccountID != "" || settings.RedirectURI != ""
}

func selectPlatformError(cache *SocialFeedCache, platform string) string {
	if !strings.HasPrefix(cache.LastError, platform+":") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(cache.LastError, platform+":"))
}

func fetchJSON(endpoint string, target interface{}) error {
	return fetchJSONWithHeaders(endpoint, nil, target)
}

func fetchJSONWithHeaders(endpoint string, headers map[string]string, target interface{}) error {
	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("remote API returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	return json.Unmarshal(body, target)
}

func fetchBody(endpoint string, headers map[string]string) ([]byte, error) {
	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("remote page returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	return body, nil
}

func (s *SocialService) syncInstagramPublic(settings SocialPlatformSettings) ([]SocialFeedItem, error) {
	username := normalizePlatformUsername("instagram", settings.ProfileURL, settings.Username)
	if username == "" {
		return nil, errors.New("instagram profile url or username is required")
	}

	endpoint := fmt.Sprintf("https://i.instagram.com/api/v1/users/web_profile_info/?username=%s", url.QueryEscape(username))
	headers := map[string]string{
		"Accept":           "*/*",
		"Referer":          fmt.Sprintf("https://www.instagram.com/%s/", username),
		"User-Agent":       defaultBrowserUA,
		"X-IG-App-ID":      "936619743392459",
		"X-ASBD-ID":        "129477",
		"X-Requested-With": "XMLHttpRequest",
	}

	var payload map[string]interface{}
	if err := fetchJSONWithHeaders(endpoint, headers, &payload); err == nil {
		if items := extractInstagramItemsFromPayload(payload, settings.PostLimit); len(items) > 0 {
			return s.localizeFeedMedia(items)
		}
	}

	body, err := fetchBody(fmt.Sprintf("https://www.instagram.com/%s/", username), map[string]string{
		"Accept":     "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
		"Referer":    "https://www.instagram.com/",
		"User-Agent": defaultBrowserUA,
	})
	if err != nil {
		return nil, err
	}

	items := extractInstagramItemsFromHTML(body, username, settings.PostLimit)
	if len(items) == 0 {
		return nil, errors.New("instagram public sync found no posts; the profile may be restricted or Instagram changed its page structure")
	}

	return s.localizeFeedMedia(items)
}

func (s *SocialService) syncTikTokPublic(settings SocialPlatformSettings) ([]SocialFeedItem, error) {
	username := normalizePlatformUsername("tiktok", settings.ProfileURL, settings.Username)
	if username == "" {
		return nil, errors.New("tiktok profile url or username is required")
	}

	endpoint := fmt.Sprintf("https://www.tiktok.com/@%s", username)
	body, err := fetchBody(endpoint, map[string]string{
		"Accept":     "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
		"User-Agent": defaultBrowserUA,
	})
	if err != nil {
		return nil, err
	}

	payload, err := extractTikTokPayload(body)
	if err != nil {
		return nil, err
	}

	items := extractTikTokItemsFromPayload(payload, username, settings.PostLimit)

	if len(items) == 0 {
		if profile, ok := firstMapPath(payload, []string{"__DEFAULT_SCOPE__", "webapp.user-detail", "userInfo"}); ok {
			if stats, ok := firstMapPath(profile, []string{"stats"}); ok {
				if firstInt64FromMap(stats, "videoCount") > 0 {
					return nil, errors.New("tiktok public sync found no posts in the page payload; TikTok now returns account info but not the post list for this profile, and the remaining feed request appears to require signed client-side calls")
				}
			}
		}
		return nil, errors.New("tiktok public sync found no posts; the profile may be private or the page structure may have changed")
	}

	return s.localizeFeedMedia(items)
}

const defaultBrowserUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"

func sanitizePostLimit(limit int) int {
	if limit <= 0 {
		return 12
	}
	if limit > 24 {
		return 24
	}
	return limit
}

func normalizePlatformUsername(platform, profileURL, fallback string) string {
	fallback = strings.TrimSpace(strings.TrimPrefix(fallback, "@"))
	if profileURL == "" {
		return fallback
	}

	parsed, err := url.Parse(profileURL)
	if err != nil {
		return fallback
	}

	segments := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	if len(segments) == 0 {
		return fallback
	}

	switch platform {
	case "instagram":
		return strings.TrimPrefix(segments[0], "@")
	case "tiktok":
		return strings.TrimPrefix(segments[0], "@")
	default:
		return fallback
	}
}

func normalizeUnixTimestamp(value int64) string {
	if value <= 0 {
		return ""
	}
	return time.Unix(value, 0).UTC().Format(time.RFC3339)
}

func firstMapPath(root map[string]interface{}, paths ...[]string) (map[string]interface{}, bool) {
	for _, path := range paths {
		if value, ok := mapPath(root, path...); ok {
			if mapped, ok := value.(map[string]interface{}); ok {
				return mapped, true
			}
		}
	}
	return nil, false
}

func firstSlicePath(root map[string]interface{}, paths ...[]string) ([]interface{}, bool) {
	for _, path := range paths {
		if value, ok := mapPath(root, path...); ok {
			if list, ok := value.([]interface{}); ok {
				return list, true
			}
		}
	}
	return nil, false
}

func mapPath(root map[string]interface{}, path ...string) (interface{}, bool) {
	var current interface{} = root
	for _, key := range path {
		node, ok := current.(map[string]interface{})
		if !ok {
			return nil, false
		}
		next, exists := node[key]
		if !exists {
			return nil, false
		}
		current = next
	}
	return current, true
}

func nestedMap(root map[string]interface{}, key string) map[string]interface{} {
	if value, ok := root[key].(map[string]interface{}); ok {
		return value
	}
	return nil
}

func sliceValueFromMap(root map[string]interface{}, key string) []interface{} {
	if value, ok := root[key].([]interface{}); ok {
		return value
	}
	return nil
}

func flattenMapSlice(items []interface{}) []map[string]interface{} {
	result := make([]map[string]interface{}, 0, len(items))
	for _, item := range items {
		if mapped, ok := item.(map[string]interface{}); ok {
			result = append(result, mapped)
		}
	}
	return result
}

func extractInstagramEdges(root map[string]interface{}) []map[string]interface{} {
	if edges, ok := root["edges"].([]interface{}); ok {
		return flattenMapSlice(edges)
	}
	return nil
}

func extractInstagramCaption(node map[string]interface{}) string {
	edgeCaption := nestedMap(node, "edge_media_to_caption")
	if len(edgeCaption) == 0 {
		return ""
	}
	edges := sliceValueFromMap(edgeCaption, "edges")
	if len(edges) == 0 {
		return ""
	}
	firstEdge, ok := edges[0].(map[string]interface{})
	if !ok {
		return ""
	}
	captionNode := nestedMap(firstEdge, "node")
	if len(captionNode) == 0 {
		return ""
	}
	return stringValueFromMap(captionNode, "text")
}

func extractInstagramItemsFromPayload(payload map[string]interface{}, limit int) []SocialFeedItem {
	userMap, ok := firstMapPath(payload,
		[]string{"data", "user"},
		[]string{"user"},
	)
	if !ok {
		return nil
	}

	candidates := []map[string]interface{}{}
	if feedMap, ok := firstMapPath(userMap,
		[]string{"edge_owner_to_timeline_media"},
		[]string{"xdt_api__v1__feed__user_timeline_graphql_connection"},
	); ok {
		candidates = extractInstagramEdges(feedMap)
	}

	if len(candidates) == 0 {
		if timelineMedia, ok := firstSlicePath(userMap,
			[]string{"edge_felix_video_timeline", "edges"},
			[]string{"edge_owner_to_timeline_media", "edges"},
		); ok {
			candidates = flattenMapSlice(timelineMedia)
		}
	}

	items := make([]SocialFeedItem, 0, len(candidates))
	for _, candidate := range candidates {
		node := nestedMap(candidate, "node")
		if len(node) == 0 {
			node = candidate
		}

		id := stringValueFromMap(node, "id")
		shortcode := stringValueFromMap(node, "shortcode")
		if id == "" || shortcode == "" {
			continue
		}

		imageURL := firstStringFromMap(node, "display_url", "thumbnail_src", "display_src")
		caption := extractInstagramCaption(node)
		timestamp := normalizeUnixTimestamp(firstInt64FromMap(node, "taken_at_timestamp"))
		mediaType := "image"
		if boolValueFromMap(node, "is_video") {
			mediaType = "video"
		}

		items = append(items, SocialFeedItem{
			ID:           id,
			Platform:     "instagram",
			Caption:      caption,
			Permalink:    fmt.Sprintf("https://www.instagram.com/p/%s/", shortcode),
			MediaType:    mediaType,
			MediaURL:     imageURL,
			ThumbnailURL: imageURL,
			Timestamp:    timestamp,
		})
		if len(items) >= limit {
			break
		}
	}

	return items
}

func extractInstagramItemsFromHTML(body []byte, username string, limit int) []SocialFeedItem {
	pattern := regexp.MustCompile(`"shortcode":"([^"]+)".*?"display_url":"([^"]+)".*?"taken_at_timestamp":([0-9]+).*?"id":"([0-9]+)"`)
	matches := pattern.FindAllSubmatch(body, limit)
	if len(matches) == 0 {
		return nil
	}

	items := make([]SocialFeedItem, 0, len(matches))
	seen := map[string]bool{}
	for _, match := range matches {
		if len(match) != 5 {
			continue
		}

		shortcode := string(match[1])
		imageURL := decodeEscapedURL(string(match[2]))
		timestamp, _ := strconv.ParseInt(string(match[3]), 10, 64)
		id := string(match[4])
		if seen[id] {
			continue
		}
		seen[id] = true

		items = append(items, SocialFeedItem{
			ID:           id,
			Platform:     "instagram",
			Caption:      "",
			Permalink:    fmt.Sprintf("https://www.instagram.com/p/%s/", shortcode),
			MediaType:    "image",
			MediaURL:     imageURL,
			ThumbnailURL: imageURL,
			Timestamp:    normalizeUnixTimestamp(timestamp),
		})
	}

	return items
}

func collectTikTokItems(root map[string]interface{}) []map[string]interface{} {
	if len(root) == 0 {
		return nil
	}

	items := []map[string]interface{}{}
	seen := map[string]bool{}

	var walk func(interface{})
	walk = func(value interface{}) {
		switch typed := value.(type) {
		case map[string]interface{}:
			if id := firstStringFromMap(typed, "id", "itemId"); id != "" {
				if looksLikeTikTokPost(typed) && !seen[id] {
					seen[id] = true
					items = append(items, typed)
				}
			}
			for _, child := range typed {
				walk(child)
			}
		case []interface{}:
			for _, child := range typed {
				walk(child)
			}
		}
	}

	walk(root)
	return items
}

func extractTikTokItemsFromPayload(payload map[string]interface{}, username string, limit int) []SocialFeedItem {
	candidates := make([]map[string]interface{}, 0)
	seen := map[string]bool{}

	appendCandidate := func(item map[string]interface{}) {
		id := firstStringFromMap(item, "id", "itemId")
		if id == "" || seen[id] || !looksLikeTikTokPost(item) {
			return
		}
		seen[id] = true
		candidates = append(candidates, item)
	}

	appendFromMap := func(root map[string]interface{}) {
		for _, item := range collectTikTokItems(root) {
			appendCandidate(item)
		}
	}

	itemModules := []map[string]interface{}{}
	for _, paths := range [][]string{
		{"__DEFAULT_SCOPE__", "webapp.user-detail", "itemModule"},
		{"__DEFAULT_SCOPE__", "webapp.video-detail", "itemInfo", "itemStruct"},
		{"ItemModule"},
		{"itemModule"},
		{"props", "pageProps", "itemModule"},
	} {
		if module, ok := firstMapPath(payload, paths); ok {
			itemModules = append(itemModules, module)
		}
	}

	for _, module := range itemModules {
		appendFromMap(module)
	}

	for _, paths := range [][]string{
		{"__DEFAULT_SCOPE__", "webapp.user-detail", "itemList"},
		{"ItemList", "user-post", "list"},
		{"itemList"},
		{"props", "pageProps", "itemList"},
	} {
		ids, ok := firstSlicePath(payload, paths)
		if !ok {
			continue
		}
		for _, rawID := range ids {
			id := strings.TrimSpace(fmt.Sprint(rawID))
			if id == "" {
				continue
			}
			for _, module := range itemModules {
				if item, ok := module[id].(map[string]interface{}); ok {
					appendCandidate(item)
					break
				}
			}
		}
	}

	if len(candidates) == 0 {
		appendFromMap(payload)
	}

	items := make([]SocialFeedItem, 0, min(limit, len(candidates)))
	for _, item := range candidates {
		feedItem, ok := buildTikTokFeedItem(item, username)
		if !ok {
			continue
		}
		items = append(items, feedItem)
		if len(items) >= limit {
			break
		}
	}

	return items
}

func looksLikeTikTokPost(item map[string]interface{}) bool {
	if len(item) == 0 {
		return false
	}
	if _, hasVideo := item["video"]; hasVideo {
		return true
	}
	if _, hasImagePost := item["imagePost"]; hasImagePost {
		return true
	}
	if firstStringFromMap(item, "cover", "dynamicCover", "originCover") != "" {
		return true
	}
	if videoMap := nestedMap(item, "video"); len(videoMap) > 0 {
		if firstStringFromMap(videoMap, "cover", "dynamicCover", "originCover", "playAddr") != "" {
			return true
		}
	}
	if imagePostMap := nestedMap(item, "imagePost"); len(imagePostMap) > 0 {
		if len(sliceValueFromMap(imagePostMap, "images")) > 0 {
			return true
		}
	}
	return false
}

func buildTikTokFeedItem(item map[string]interface{}, username string) (SocialFeedItem, bool) {
	id := firstStringFromMap(item, "id", "itemId")
	if id == "" {
		return SocialFeedItem{}, false
	}

	caption := firstStringFromMap(item, "desc", "title")
	createTime := normalizeUnixTimestamp(firstInt64FromMap(item, "createTime"))
	videoMap := nestedMap(item, "video")
	imagePostMap := nestedMap(item, "imagePost")
	coverURL := firstStringFromMap(
		videoMap,
		"cover",
		"dynamicCover",
		"originCover",
		"playAddr",
	)
	if coverURL == "" {
		coverURL = firstStringFromMap(item, "cover", "dynamicCover", "originCover")
	}
	if coverURL == "" {
		if images := sliceValueFromMap(imagePostMap, "images"); len(images) > 0 {
			if firstImage, ok := images[0].(map[string]interface{}); ok {
				coverURL = firstStringFromMap(firstImage, "imageURL", "imageUrl", "displayImageURL")
			}
		}
	}

	mediaType := "video"
	if len(imagePostMap) > 0 {
		mediaType = "image"
	}

	return SocialFeedItem{
		ID:           id,
		Platform:     "tiktok",
		Caption:      caption,
		Permalink:    fmt.Sprintf("https://www.tiktok.com/@%s/video/%s", username, id),
		MediaType:    mediaType,
		MediaURL:     coverURL,
		ThumbnailURL: coverURL,
		Timestamp:    createTime,
	}, true
}

func extractTikTokPayload(body []byte) (map[string]interface{}, error) {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?s)<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">\s*(\{.*?\})\s*</script>`),
		regexp.MustCompile(`(?s)<script id="SIGI_STATE" type="application/json">\s*(\{.*?\})\s*</script>`),
		regexp.MustCompile(`(?s)<script id="__NEXT_DATA__" type="application/json">\s*(\{.*?\})\s*</script>`),
	}

	for _, pattern := range patterns {
		matches := pattern.FindSubmatch(body)
		if len(matches) != 2 {
			continue
		}

		var payload map[string]interface{}
		if err := json.Unmarshal(matches[1], &payload); err == nil {
			return payload, nil
		}
	}

	return nil, errors.New("could not extract tiktok public data payload from profile page")
}

func decodeEscapedURL(value string) string {
	value = strings.ReplaceAll(value, `\u0026`, "&")
	value = strings.ReplaceAll(value, `\/`, "/")
	return html.UnescapeString(value)
}

func (s *SocialService) localizeFeedMedia(items []SocialFeedItem) ([]SocialFeedItem, error) {
	localized := make([]SocialFeedItem, 0, len(items))
	for _, item := range items {
		mediaURL := item.MediaURL
		thumbnailURL := item.ThumbnailURL

		var err error
		if mediaURL != "" {
			mediaURL, err = downloadSocialAsset(item.Platform, item.ID, "media", mediaURL)
			if err != nil {
				return nil, err
			}
		}

		if thumbnailURL != "" {
			thumbnailURL, err = downloadSocialAsset(item.Platform, item.ID, "thumb", thumbnailURL)
			if err != nil {
				return nil, err
			}
		}

		if mediaURL == "" {
			mediaURL = thumbnailURL
		}
		if thumbnailURL == "" {
			thumbnailURL = mediaURL
		}

		item.MediaURL = mediaURL
		item.ThumbnailURL = thumbnailURL
		localized = append(localized, item)
	}

	return localized, nil
}

func downloadSocialAsset(platform, itemID, kind, sourceURL string) (string, error) {
	sourceURL = strings.TrimSpace(sourceURL)
	if sourceURL == "" || !strings.HasPrefix(sourceURL, "http") {
		return sourceURL, nil
	}

	uploadPath := strings.TrimSpace(viper.GetString("upload.path"))
	if uploadPath == "" {
		uploadPath = "./uploads"
	}

	relativeDir := filepath.Join("social", platform)
	targetDir := filepath.Join(uploadPath, relativeDir)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodGet, sourceURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", defaultBrowserUA)
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Referer", sourceURL)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return "", fmt.Errorf("failed to download social image %s %s: %d %s", platform, itemID, resp.StatusCode, strings.TrimSpace(string(body)))
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if len(data) == 0 {
		return "", fmt.Errorf("empty social image payload for %s %s", platform, itemID)
	}

	ext := inferSocialAssetExtension(sourceURL, resp.Header.Get("Content-Type"))
	hash := fmt.Sprintf("%x", sha1.Sum([]byte(sourceURL)))
	filename := fmt.Sprintf("%s_%s_%s_%s%s", platform, itemID, kind, hash[:12], ext)
	targetPath := filepath.Join(targetDir, filename)

	if err := os.WriteFile(targetPath, data, 0644); err != nil {
		return "", err
	}

	return "/" + filepath.ToSlash(filepath.Join("uploads", relativeDir, filename)), nil
}

func inferSocialAssetExtension(sourceURL, contentType string) string {
	if parsed, err := url.Parse(sourceURL); err == nil {
		ext := strings.ToLower(strings.TrimSpace(filepath.Ext(parsed.Path)))
		if ext != "" && len(ext) <= 6 {
			return ext
		}
	}

	if exts, err := mime.ExtensionsByType(strings.TrimSpace(contentType)); err == nil {
		for _, ext := range exts {
			if ext != "" {
				return ext
			}
		}
	}

	return ".jpg"
}

func firstStringFromMap(root map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if value := stringValueFromMap(root, key); value != "" {
			return value
		}
	}
	return ""
}

func stringValueFromMap(root map[string]interface{}, key string) string {
	if root == nil {
		return ""
	}

	switch value := root[key].(type) {
	case string:
		return strings.TrimSpace(value)
	case json.Number:
		return value.String()
	case float64:
		if value == 0 {
			return ""
		}
		return strconv.FormatInt(int64(value), 10)
	}
	return ""
}

func firstInt64FromMap(root map[string]interface{}, keys ...string) int64 {
	for _, key := range keys {
		if value := int64ValueFromMap(root, key); value > 0 {
			return value
		}
	}
	return 0
}

func int64ValueFromMap(root map[string]interface{}, key string) int64 {
	if root == nil {
		return 0
	}

	switch value := root[key].(type) {
	case float64:
		return int64(value)
	case int64:
		return value
	case string:
		parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
		if err == nil {
			return parsed
		}
	case json.Number:
		parsed, err := value.Int64()
		if err == nil {
			return parsed
		}
	}
	return 0
}

func boolValueFromMap(root map[string]interface{}, key string) bool {
	if root == nil {
		return false
	}
	value, _ := root[key].(bool)
	return value
}
