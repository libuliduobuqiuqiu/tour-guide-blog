package routers

import (
	"tour-guide-blog-backend/internal/api/middleware"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func InitRouter() *gin.Engine {
	r := gin.Default()

	// 静态文件服务
	r.Static("/uploads", viper.GetString("upload.path"))

	// 允许跨域
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	admin := r.Group("/admin")
	protected := admin.Group("/")
	protected.Use(middleware.Auth())

	// 注册各个模块路由
	RegisterAuthRoutes(admin)
	RegisterTourRoutes(api, protected)
	RegisterPostRoutes(api, protected)
	RegisterContactRoutes(api, protected)
	RegisterConfigRoutes(api, protected)
	RegisterCarouselRoutes(api, protected)
	RegisterReviewRoutes(api, protected)
	RegisterUploadRoutes(protected)

	return r
}
