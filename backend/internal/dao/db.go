package dao

import (
	"log"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(dsn string) {
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// 自动迁移
	err = DB.AutoMigrate(
		&model.Tour{},
		&model.Post{},
		&model.Contact{},
		&model.Admin{},
		&model.Config{},
		&model.Carousel{},
		&model.Review{},
	)
	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// 初始化 gorm-gen 的 query
	query.SetDefault(DB)
}
