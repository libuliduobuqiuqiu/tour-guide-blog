package model

import (
	"time"

	"gorm.io/gorm"
)

// Tour 行程详情
type Tour struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Content     string         `gorm:"type:longtext" json:"content"`
	CoverImage  string         `gorm:"size:255" json:"cover_image"`
	Price       float64        `gorm:"type:decimal(10,2)" json:"price"`
	Duration    string         `gorm:"size:100" json:"duration"`
	Location    string         `gorm:"size:255" json:"location"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Post 博客文章
type Post struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Title      string         `gorm:"size:255;not null" json:"title"`
	Summary    string         `gorm:"size:500" json:"summary"`
	Content    string         `gorm:"type:longtext" json:"content"`
	Author     string         `gorm:"size:100" json:"author"`
	CoverImage string         `gorm:"size:255" json:"cover_image"`
	Category   string         `gorm:"size:100" json:"category"`
	Tags       string         `gorm:"size:255" json:"tags"` // 以逗号分隔的标签
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// Contact 联系信息
type Contact struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Email     string    `gorm:"size:100;not null" json:"email"`
	Subject   string    `gorm:"size:255" json:"subject"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// Admin 后台管理员
type Admin struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:100;uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Config 系统配置 (用于存储首页、关于我、联系方式等 JSON 或字符串)
type Config struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Key   string `gorm:"size:100;uniqueIndex;not null" json:"key"`
	Value string `gorm:"type:longtext" json:"value"`
}

// Carousel 轮播图
type Carousel struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:255" json:"title"`
	ImageUrl    string    `gorm:"size:255;not null" json:"image_url"`
	LinkUrl     string    `gorm:"size:255" json:"link_url"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Review 用户评价
type Review struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Username    string    `gorm:"size:100;not null" json:"username"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Avatar      string    `gorm:"size:255" json:"avatar"`
	Rating      int       `gorm:"default:5" json:"rating"` // 1-5 stars
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
