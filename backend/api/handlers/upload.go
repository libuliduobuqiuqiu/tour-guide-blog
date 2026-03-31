package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/spf13/viper"
)

type uploadRateEntry struct {
	Count     int
	WindowEnd time.Time
}

var (
	reviewUploadRateMu      sync.Mutex
	reviewUploadRateEntries = map[string]uploadRateEntry{}
)

const (
	reviewPhotoMaxSize    int64 = 4 * 1024 * 1024
	reviewPhotoRateLimit        = 12
	reviewPhotoRateWindow       = 10 * time.Minute
)

func UploadImage(c *gin.Context) {
	uploadImage(c, viper.GetInt64("upload.max_size"))
}

func UploadReviewPhoto(c *gin.Context) {
	clientIP := getClientIP(c)
	if !validateReviewUploadRate(clientIP) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many upload requests. Please try again later."})
		return
	}

	uploadImage(c, reviewPhotoMaxSize)
}

func validateReviewUploadRate(clientIP string) bool {
	now := time.Now()

	reviewUploadRateMu.Lock()
	defer reviewUploadRateMu.Unlock()

	for key, entry := range reviewUploadRateEntries {
		if now.After(entry.WindowEnd) {
			delete(reviewUploadRateEntries, key)
		}
	}

	entry := reviewUploadRateEntries[clientIP]
	if now.After(entry.WindowEnd) {
		entry = uploadRateEntry{
			Count:     0,
			WindowEnd: now.Add(reviewPhotoRateWindow),
		}
	}

	if entry.Count >= reviewPhotoRateLimit {
		reviewUploadRateEntries[clientIP] = entry
		return false
	}

	entry.Count++
	reviewUploadRateEntries[clientIP] = entry
	return true
}

func uploadImage(c *gin.Context, maxSize int64) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	ext := strings.ToLower(strings.TrimSpace(filepath.Ext(file.Filename)))
	allowTypes := viper.GetStringSlice("upload.allow_types")
	if len(allowTypes) == 0 {
		allowTypes = []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	}

	normalizedAllowTypes := make(map[string]struct{}, len(allowTypes))
	for _, t := range allowTypes {
		normalized := strings.ToLower(strings.TrimSpace(t))
		if normalized == "" {
			continue
		}
		if !strings.HasPrefix(normalized, ".") {
			normalized = "." + normalized
		}
		normalizedAllowTypes[normalized] = struct{}{}
	}

	if _, ok := normalizedAllowTypes[ext]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File type not allowed, supported: jpg, jpeg, png, gif, webp",
		})
		return
	}

	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	uploadPath := viper.GetString("upload.path")
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	newFilename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102"), uuid.New().String()[:8], ext)
	dst := filepath.Join(uploadPath, newFilename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	url := fmt.Sprintf("/uploads/%s", newFilename)
	c.JSON(http.StatusOK, gin.H{
		"url":      url,
		"filename": newFilename,
	})
}
