package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterContactRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.POST("/contact", handlers.CreateContact)

	protected.GET("/contacts", handlers.ListContacts)
}
