package handlers

import (
	"net/http"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

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

	if err := service.Config.Update(key, req.Value); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Config updated"})
}
