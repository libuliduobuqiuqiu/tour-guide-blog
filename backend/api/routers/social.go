package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterSocialRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/social/feed", handlers.GetSocialFeed)
	rg.GET("/social/image", handlers.ProxySocialImage)

	protected.GET("/social/settings", handlers.GetSocialSettings)
	protected.PUT("/social/settings", handlers.UpdateSocialSettings)
	protected.GET("/social/status", handlers.GetSocialStatus)
	protected.POST("/social/sync", handlers.SyncSocialFeed)
}
