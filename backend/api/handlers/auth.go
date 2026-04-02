package handlers

import (
	"net/http"
	"sync"
	"time"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginRateEntry struct {
	Count     int
	WindowEnd time.Time
}

var (
	loginRateMu      sync.Mutex
	loginRateEntries = map[string]loginRateEntry{}
)

const (
	loginRateWindow = 10 * time.Minute
	loginRateLimit  = 10
)

func Login(c *gin.Context) {
	clientIP := getClientIP(c)
	if !allowLoginAttempt(clientIP) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many login attempts. Please try again later."})
		return
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	admin, token, err := service.Auth.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": admin.Username,
	})
}

func allowLoginAttempt(clientIP string) bool {
	now := time.Now()

	loginRateMu.Lock()
	defer loginRateMu.Unlock()

	for key, entry := range loginRateEntries {
		if now.After(entry.WindowEnd) {
			delete(loginRateEntries, key)
		}
	}

	entry := loginRateEntries[clientIP]
	if now.After(entry.WindowEnd) {
		entry = loginRateEntry{
			Count:     0,
			WindowEnd: now.Add(loginRateWindow),
		}
	}

	if entry.Count >= loginRateLimit {
		loginRateEntries[clientIP] = entry
		return false
	}

	entry.Count++
	loginRateEntries[clientIP] = entry
	return true
}
