package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterPostRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/posts", handlers.ListPosts)
	rg.GET("/posts/:id", handlers.GetPost)

	protected.GET("/posts", handlers.ListPosts)
	protected.POST("/posts", handlers.CreatePost)
	protected.PUT("/posts/:id", handlers.UpdatePost)
	protected.DELETE("/posts/:id", handlers.DeletePost)
}
