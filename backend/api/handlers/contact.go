package handlers

import (
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"sync"
	"time"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type createContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	Website string `json:"website"`
}

type siteSettingsSnapshot struct {
	ContactEmail string `json:"contact_email"`
}

type contactRateEntry struct {
	Count     int
	WindowEnd time.Time
}

var (
	contactRateMu      sync.Mutex
	contactRateEntries = map[string]contactRateEntry{}
)

const (
	contactRateWindow = 10 * time.Minute
	contactRateLimit  = 5
)

func validateContactRate(clientIP string) bool {
	now := time.Now()

	contactRateMu.Lock()
	defer contactRateMu.Unlock()

	for key, entry := range contactRateEntries {
		if now.After(entry.WindowEnd) {
			delete(contactRateEntries, key)
		}
	}

	entry := contactRateEntries[clientIP]
	if now.After(entry.WindowEnd) {
		entry = contactRateEntry{
			Count:     0,
			WindowEnd: now.Add(contactRateWindow),
		}
	}

	if entry.Count >= contactRateLimit {
		contactRateEntries[clientIP] = entry
		return false
	}

	entry.Count++
	contactRateEntries[clientIP] = entry
	return true
}

func getClientIP(c *gin.Context) string {
	ip := strings.TrimSpace(c.ClientIP())
	if ip == "" {
		ip = strings.TrimSpace(c.RemoteIP())
	}
	if parsed := net.ParseIP(ip); parsed != nil {
		return parsed.String()
	}
	return "unknown"
}

func validateConfiguredContactEmail() error {
	item, err := service.Config.GetByKey("site_settings")
	if err != nil {
		return errors.New("contact email is not configured")
	}

	var settings siteSettingsSnapshot
	if err := json.Unmarshal([]byte(item.Value), &settings); err != nil {
		return errors.New("site settings are invalid")
	}

	address := strings.TrimSpace(settings.ContactEmail)
	if address == "" {
		return errors.New("contact email is not configured")
	}
	if _, err := mail.ParseAddress(address); err != nil {
		return errors.New("contact email is invalid")
	}

	return nil
}

func CreateContact(c *gin.Context) {
	var req createContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(req.Website) != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "spam detected"})
		return
	}

	clientIP := getClientIP(c)
	if !validateContactRate(clientIP) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests. Please try again later."})
		return
	}

	if err := validateConfiguredContactEmail(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
		return
	}

	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(req.Email)
	subject := strings.TrimSpace(req.Subject)
	message := strings.TrimSpace(req.Message)

	if len(name) < 2 || len(name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be between 2 and 100 characters."})
		return
	}
	if _, err := mail.ParseAddress(email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please enter a valid email address."})
		return
	}
	if len(subject) == 0 || len(subject) > 255 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subject is required and must be shorter than 255 characters."})
		return
	}
	if len(message) < 10 || len(message) > 5000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message must be between 10 and 5000 characters."})
		return
	}

	contact := model.Contact{
		Name:    name,
		Email:   email,
		Subject: subject,
		Message: message,
	}

	if err := service.Contact.Create(&contact); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, contact)
}

func ListContacts(c *gin.Context) {
	contacts, err := service.Contact.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, contacts)
}

func DeleteContact(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := service.Contact.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted"})
}

func DeleteContactsBatch(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No contact IDs provided"})
		return
	}

	if err := service.Contact.DeleteBatch(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contacts deleted"})
}
