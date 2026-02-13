package routers

import (
	"tour-guide-blog-backend/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterReviewRoutes(rg *gin.RouterGroup, protected *gin.RouterGroup) {
	rg.GET("/reviews", handlers.ListReviews)

	protected.GET("/reviews", handlers.ListReviews)
	protected.POST("/reviews", handlers.CreateReview)
	protected.PUT("/reviews/:id", handlers.UpdateReview)
	protected.DELETE("/reviews/:id", handlers.DeleteReview)
	protected.POST("/reviews/generate", handlers.GenerateReviews)
}
