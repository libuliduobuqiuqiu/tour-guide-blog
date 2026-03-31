package routers

import (
	"tour-guide-blog-backend/api/handlers"
	"tour-guide-blog-backend/api/middleware"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func InitRouter(debug bool) *gin.Engine {
	logWriter := initHTTPLogWriter(debug)
	r := gin.New()
	r.Use(gin.LoggerWithWriter(logWriter))
	r.Use(gin.RecoveryWithWriter(logWriter))
	r.Use(middleware.ErrorStackLogger(logWriter))

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
	apiAdmin := api.Group("/admin")
	apiProtected := apiAdmin.Group("/")
	apiProtected.Use(middleware.Auth())

	// 注册各个模块路由
	RegisterAuthRoutes(admin)
	// 兼容前端通过 /api/admin/login 访问登录接口
	api.POST("/admin/login", handlers.Login)
	RegisterTourRoutes(api, protected)
	RegisterPostRoutes(api, protected)
	RegisterContactRoutes(api, protected)
	RegisterConfigRoutes(api, protected)
	RegisterCarouselRoutes(api, protected)
	RegisterReviewRoutes(api, protected)
	RegisterSocialRoutes(api, protected)
	RegisterUploadRoutes(protected)
	protected.GET("/stats", handlers.GetAdminStats)
	registerAPIAdminAliases(apiProtected)

	return r
}

func registerAPIAdminAliases(protected *gin.RouterGroup) {
	protected.GET("/tours", handlers.ListTours)
	protected.POST("/tours", handlers.CreateTour)
	protected.POST("/tours/reorder", handlers.ReorderTours)
	protected.PUT("/tours/:id", handlers.UpdateTour)
	protected.DELETE("/tours/:id", handlers.DeleteTour)

	protected.GET("/posts", handlers.ListPosts)
	protected.POST("/posts", handlers.CreatePost)
	protected.POST("/posts/reorder", handlers.ReorderPosts)
	protected.PUT("/posts/:id", handlers.UpdatePost)
	protected.DELETE("/posts/:id", handlers.DeletePost)

	protected.GET("/contacts", handlers.ListContacts)
	protected.DELETE("/contacts/:id", handlers.DeleteContact)
	protected.POST("/contacts/batch-delete", handlers.DeleteContactsBatch)

	protected.PUT("/config/:key", handlers.UpdateConfig)

	protected.GET("/carousels", handlers.ListCarousels)
	protected.POST("/carousels", handlers.CreateCarousel)
	protected.POST("/carousels/reorder", handlers.ReorderCarousels)
	protected.PUT("/carousels/:id", handlers.UpdateCarousel)
	protected.DELETE("/carousels/:id", handlers.DeleteCarousel)

	protected.GET("/reviews", handlers.ListReviews)
	protected.POST("/reviews", handlers.CreateReview)
	protected.POST("/reviews/reorder", handlers.ReorderReviews)
	protected.PUT("/reviews/:id", handlers.UpdateReview)
	protected.DELETE("/reviews/:id", handlers.DeleteReview)
	protected.POST("/reviews/generate", handlers.GenerateReviews)

	protected.GET("/social/settings", handlers.GetSocialSettings)
	protected.PUT("/social/settings", handlers.UpdateSocialSettings)
	protected.GET("/social/status", handlers.GetSocialStatus)
	protected.POST("/social/sync", handlers.SyncSocialFeed)

	protected.POST("/upload", handlers.UploadImage)
	protected.GET("/stats", handlers.GetAdminStats)
}
