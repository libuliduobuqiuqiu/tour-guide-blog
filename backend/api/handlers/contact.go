package handlers

import (
	"net/http"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func CreateContact(c *gin.Context) {
	var contact model.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
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
