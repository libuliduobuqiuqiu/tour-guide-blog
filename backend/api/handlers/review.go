package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type createPublicReviewRequest struct {
	Username string   `json:"username"`
	Country  string   `json:"country"`
	Content  string   `json:"content"`
	Rating   int      `json:"rating"`
	Photos   []string `json:"photos"`
	Website  string   `json:"website"`
}

type reviewReorderRequest struct {
	IDs []uint `json:"ids"`
}

type reviewDashboardVisibilityRequest struct {
	ShowOnDashboard bool `json:"show_on_dashboard"`
}

type reviewRateEntry struct {
	Count     int
	WindowEnd time.Time
}

var (
	reviewRateMu      sync.Mutex
	reviewRateEntries = map[string]reviewRateEntry{}
)

const (
	reviewRateWindow       = 10 * time.Minute
	reviewSubmitRateLimit  = 4
	maxReviewPhotoCount    = 3
	maxReviewContentLength = 2000
)

func validateReviewRate(clientIP string) bool {
	now := time.Now()

	reviewRateMu.Lock()
	defer reviewRateMu.Unlock()

	for key, entry := range reviewRateEntries {
		if now.After(entry.WindowEnd) {
			delete(reviewRateEntries, key)
		}
	}

	entry := reviewRateEntries[clientIP]
	if now.After(entry.WindowEnd) {
		entry = reviewRateEntry{
			Count:     0,
			WindowEnd: now.Add(reviewRateWindow),
		}
	}

	if entry.Count >= reviewSubmitRateLimit {
		reviewRateEntries[clientIP] = entry
		return false
	}

	entry.Count++
	reviewRateEntries[clientIP] = entry
	return true
}

func validateReviewPhotoURLs(urls []string) ([]string, error) {
	if len(urls) > maxReviewPhotoCount {
		return nil, errors.New("too many photos")
	}

	photos := make([]string, 0, len(urls))
	seen := map[string]struct{}{}
	for _, raw := range urls {
		url := strings.TrimSpace(raw)
		if url == "" {
			continue
		}
		if !strings.HasPrefix(url, "/uploads/") {
			return nil, errors.New("unsupported photo url")
		}
		if _, exists := seen[url]; exists {
			continue
		}
		seen[url] = struct{}{}
		photos = append(photos, url)
	}
	if len(photos) > maxReviewPhotoCount {
		return nil, errors.New("too many photos")
	}
	return photos, nil
}

func ListReviews(c *gin.Context) {
	activeOnly := c.Query("active") == "true"

	var (
		list []*model.Review
		err  error
	)

	if activeOnly {
		list, err = service.Review.ListActive()
	} else {
		list, err = service.Review.List()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func CreatePublicReview(c *gin.Context) {
	var req createPublicReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(req.Website) != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "spam detected"})
		return
	}

	clientIP := getClientIP(c)
	if !validateReviewRate(clientIP) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many review submissions. Please try again later."})
		return
	}

	username := strings.TrimSpace(req.Username)
	country := strings.TrimSpace(req.Country)
	content := strings.TrimSpace(req.Content)

	if len(username) < 2 || len(username) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be between 2 and 100 characters."})
		return
	}
	if len(country) < 2 || len(country) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please select a valid country."})
		return
	}
	if len(content) < 10 || len(content) > maxReviewContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content must be between 10 and 2000 characters."})
		return
	}
	if req.Rating < 1 || req.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 1 and 5."})
		return
	}

	photos, err := validateReviewPhotoURLs(req.Photos)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Photos are invalid. Please upload up to 3 images."})
		return
	}

	review := model.Review{
		Username:   username,
		Country:    country,
		ReviewDate: time.Now().Format("2006-01-02"),
		Content:    content,
		Photos:     model.StringList(photos),
		Rating:     req.Rating,
		IsActive:   false,
	}

	if err := service.Review.Create(&review); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Review submitted and pending approval."})
}

func CreateReview(c *gin.Context) {
	var req model.Review
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Review.Create(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, req)
}

func UpdateReview(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req model.Review
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Review.Update(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Review updated"})
}

func ReorderReviews(c *gin.Context) {
	var req reviewReorderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No review IDs provided"})
		return
	}

	if err := service.Review.Reorder(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Review order updated"})
}

func DeleteReview(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := service.Review.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Review deleted"})
}

func UpdateReviewDashboardVisibility(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req reviewDashboardVisibilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Review.SetDashboardVisible(uint(id), req.ShowOnDashboard); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review dashboard visibility updated"})
}

func GenerateReviews(c *gin.Context) {
	if err := service.Review.GenerateInitialReviews(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reviews generated"})
}
