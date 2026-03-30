package handlers

import (
	"encoding/json"
	"net/http"
	"net/mail"
	"strings"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type siteSettingsConfig struct {
	ContactEmail string `json:"contact_email"`
}

func GetAbout(c *gin.Context) {
	item, err := service.Config.GetAbout()
	if err != nil {
		// 如果数据库没有，返回默认值
		c.JSON(http.StatusOK, gin.H{
			"name":  "Janet",
			"bio":   "A professional tour guide in Chongqing & Chengdu.",
			"image": "/images/janet.jpg",
		})
		return
	}
	c.Data(http.StatusOK, "application/json", []byte(item.Value))
}

func GetConfig(c *gin.Context) {
	key := c.Param("key")
	item, err := service.Config.GetByKey(key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Config not found"})
		return
	}
	c.Data(http.StatusOK, "application/json", []byte(item.Value))
}

func UpdateConfig(c *gin.Context) {
	key := c.Param("key")
	var req struct {
		Value string `json:"value"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if key == "site_settings" {
		var settings siteSettingsConfig
		if err := json.Unmarshal([]byte(req.Value), &settings); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "site settings payload is invalid"})
			return
		}

		address := strings.TrimSpace(settings.ContactEmail)
		if address == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "contact email is required"})
			return
		}
		if _, err := mail.ParseAddress(address); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "contact email is invalid"})
			return
		}

		lower := strings.ToLower(address)
		if strings.HasSuffix(lower, "@example.com") || strings.HasSuffix(lower, "@test.com") || strings.HasSuffix(lower, "@invalid.com") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "contact email must use a real inbox address"})
			return
		}
	}

	if err := service.Config.Update(key, req.Value); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Config updated"})
}
