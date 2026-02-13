package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterUploadRoutes(protected *gin.RouterGroup) {
	protected.POST("/upload", handlers.UploadImage)
}
