package service

import "testing"

func TestSanitizePostLimit(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  int
	}{
		{name: "default when zero", input: 0, want: 12},
		{name: "cap upper bound", input: 40, want: 24},
		{name: "keep valid", input: 8, want: 8},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := sanitizePostLimit(tt.input); got != tt.want {
				t.Fatalf("sanitizePostLimit(%d)=%d, want %d", tt.input, got, tt.want)
			}
		})
	}
}

func TestNormalizePlatformUsername(t *testing.T) {
	tests := []struct {
		name     string
		platform string
		url      string
		fallback string
		want     string
	}{
		{name: "instagram from url", platform: "instagram", url: "https://www.instagram.com/test_user/", fallback: "abc", want: "test_user"},
		{name: "tiktok from url", platform: "tiktok", url: "https://www.tiktok.com/@test_user", fallback: "abc", want: "test_user"},
		{name: "fallback when invalid url", platform: "instagram", url: "://bad", fallback: "@fallback", want: "fallback"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := normalizePlatformUsername(tt.platform, tt.url, tt.fallback); got != tt.want {
				t.Fatalf("normalizePlatformUsername()=%q, want %q", got, tt.want)
			}
		})
	}
}

func TestSelectPlatformError(t *testing.T) {
	cache := &SocialFeedCache{LastError: "instagram: failed to fetch"}
	if got := selectPlatformError(cache, "instagram"); got != "failed to fetch" {
		t.Fatalf("unexpected platform error: %q", got)
	}
	if got := selectPlatformError(cache, "tiktok"); got != "" {
		t.Fatalf("expected empty error for different platform, got %q", got)
	}
}

func TestBuildTikTokFeedItemFromYTDLP(t *testing.T) {
	entry := ytDLPEntry{
		ID:          "123",
		URL:         "https://www.tiktok.com/@u/video/123",
		Title:       "Title",
		Description: "Desc",
		Timestamp:   1710000000,
		Thumbnails:  []ytDLPThumbnailRef{{ID: "cover", URL: "https://img/cover.jpg"}},
	}

	item, ok := buildTikTokFeedItemFromYTDLP(entry, "u")
	if !ok {
		t.Fatal("expected item to be built")
	}
	if item.ID != "123" || item.ThumbnailURL == "" || item.MediaURL == "" {
		t.Fatalf("unexpected item: %#v", item)
	}
}
