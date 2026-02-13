package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterCarouselRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/carousels", handlers.ListCarousels)

	protected.GET("/carousels", handlers.ListCarousels)
	protected.POST("/carousels", handlers.CreateCarousel)
	protected.PUT("/carousels/:id", handlers.UpdateCarousel)
	protected.DELETE("/carousels/:id", handlers.DeleteCarousel)
}
