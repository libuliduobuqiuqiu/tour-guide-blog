package handlers

import (
	"net/http"
	"strconv"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func ListTours(c *gin.Context) {
	tours, err := service.Tour.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tours)
}

func GetTour(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	tour, err := service.Tour.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tour not found"})
		return
	}
	c.JSON(http.StatusOK, tour)
}

func CreateTour(c *gin.Context) {
	var tour model.Tour
	if err := c.ShouldBindJSON(&tour); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Tour.Create(&tour); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, tour)
}

func UpdateTour(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var tour model.Tour
	if err := c.ShouldBindJSON(&tour); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Tour.Update(uint(id), &tour); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tour updated"})
}

func DeleteTour(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := service.Tour.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tour deleted"})
}
