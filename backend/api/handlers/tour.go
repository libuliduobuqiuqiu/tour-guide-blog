package handlers

import (
	"net/http"
	"strconv"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func ListTours(c *gin.Context) {
	listTours(c, false)
}

func ListAdminTours(c *gin.Context) {
	listTours(c, true)
}

func listTours(c *gin.Context, includeDrafts bool) {
	withContent := c.Query("with_content") == "true"
	var tours []*model.Tour
	var err error
	if withContent {
		if includeDrafts {
			tours, err = service.Tour.ListAll()
		} else {
			tours, err = service.Tour.ListPublished()
		}
	} else {
		if includeDrafts {
			tours, err = service.Tour.ListLiteAll()
		} else {
			tours, err = service.Tour.ListLitePublished()
		}
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tours)
}

func GetTour(c *gin.Context) {
	getTour(c, false)
}

func GetAdminTour(c *gin.Context) {
	getTour(c, true)
}

func getTour(c *gin.Context, includeDrafts bool) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	var (
		tour *model.Tour
		err  error
	)
	if includeDrafts {
		tour, err = service.Tour.GetAdminByID(uint(id))
	} else {
		tour, err = service.Tour.GetPublishedByID(uint(id))
	}
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

func UpdateTourVisibility(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Tour.SetVisibility(uint(id), req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tour visibility updated"})
}

func ReorderTours(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids is required"})
		return
	}

	if err := service.Tour.Reorder(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tour order updated"})
}
