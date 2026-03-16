package handlers

import (
	"net/http"
	"tour-guide-blog-backend/internal/query"

	"github.com/gin-gonic/gin"
)

func GetAdminStats(c *gin.Context) {
	tours, err := query.Tour.Count()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	posts, err := query.Post.Count()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	contacts, err := query.Contact.Count()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tours":    tours,
		"posts":    posts,
		"contacts": contacts,
	})
}
