package routers

import (
	"tour-guide-blog-backend/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(rg *gin.RouterGroup) {
	rg.POST("/login", handlers.Login)
}
