package dao

import (
	"log"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(dsn string, debug bool) {
	var err error
	cfg := &gorm.Config{}
	if debug {
		cfg.Logger = logger.Default.LogMode(logger.Info)
	}

	DB, err = gorm.Open(mysql.Open(dsn), cfg)
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
