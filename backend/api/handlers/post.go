package handlers

import (
	"net/http"
	"strconv"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func ListPosts(c *gin.Context) {
	tag := c.Query("tag")
	withContent := c.Query("with_content") == "true"
	var posts []*model.Post
	var err error
	if withContent {
		posts, err = service.Post.List(tag)
	} else {
		posts, err = service.Post.ListLite(tag)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, posts)
}

func GetPost(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	post, err := service.Post.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func CreatePost(c *gin.Context) {
	var post model.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Post.Create(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, post)
}

func UpdatePost(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var post model.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.Post.Update(uint(id), &post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post updated"})
}

func DeletePost(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := service.Post.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}

func ReorderPosts(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids is required"})
		return
	}

	if err := service.Post.Reorder(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post order updated"})
}
