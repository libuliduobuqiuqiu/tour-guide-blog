package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/spf13/viper"
)

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 检查文件类型
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowTypes := viper.GetStringSlice("upload.allow_types")
	allowed := false
	for _, t := range allowTypes {
		if t == ext {
			allowed = true
			break
		}
	}
	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File type not allowed"})
		return
	}

	// 检查大小
	maxSize := viper.GetInt64("upload.max_size")
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	// 确保存储目录存在
	uploadPath := viper.GetString("upload.path")
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// 生成新文件名
	newFilename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102"), uuid.New().String()[:8], ext)
	dst := filepath.Join(uploadPath, newFilename)

	// 保存文件
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// 返回访问URL
	// 假设静态文件服务挂载在 /uploads
	url := fmt.Sprintf("/uploads/%s", newFilename)
	c.JSON(http.StatusOK, gin.H{
		"url":      url,
		"filename": newFilename,
	})
}
