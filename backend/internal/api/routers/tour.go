package routers

import (
	"tour-guide-blog-backend/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterTourRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/tours", handlers.ListTours)
	rg.GET("/tours/:id", handlers.GetTour)

	protected.GET("/tours", handlers.ListTours)
	protected.POST("/tours", handlers.CreateTour)
	protected.PUT("/tours/:id", handlers.UpdateTour)
	protected.DELETE("/tours/:id", handlers.DeleteTour)
}
