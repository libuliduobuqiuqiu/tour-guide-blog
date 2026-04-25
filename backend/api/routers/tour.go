package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterTourRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/tours", handlers.ListTours)
	rg.GET("/tours/:id", handlers.GetTour)

	protected.GET("/tours", handlers.ListAdminTours)
	protected.GET("/tours/:id", handlers.GetAdminTour)
	protected.POST("/tours", handlers.CreateTour)
	protected.POST("/tours/reorder", handlers.ReorderTours)
	protected.PATCH("/tours/:id/visibility", handlers.UpdateTourVisibility)
	protected.PUT("/tours/:id", handlers.UpdateTour)
	protected.DELETE("/tours/:id", handlers.DeleteTour)
}
