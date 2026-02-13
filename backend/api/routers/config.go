package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterConfigRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/about", handlers.GetAbout)
	rg.GET("/config/:key", handlers.GetConfig)

	protected.PUT("/config/:key", handlers.UpdateConfig)
}
