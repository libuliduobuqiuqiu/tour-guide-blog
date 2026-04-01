package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type StringList []string

func (s StringList) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}

	data, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(data), nil
}

func (s *StringList) Scan(value interface{}) error {
	if value == nil {
		*s = StringList{}
		return nil
	}

	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return errors.New("unsupported scan type for StringList")
	}

	if len(raw) == 0 {
		*s = StringList{}
		return nil
	}

	var parsed []string
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return err
	}
	*s = StringList(parsed)
	return nil
}

// Tour 行程详情
type Tour struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Content     string         `gorm:"type:longtext" json:"content"`
	Highlights  StringList     `gorm:"type:json" json:"highlights"`
	Places      StringList     `gorm:"type:json" json:"places"`
	CoverImage  string         `gorm:"size:255" json:"cover_image"`
	Price       float64        `gorm:"type:decimal(10,2)" json:"price"`
	Duration    string         `gorm:"size:100" json:"duration"`
	Location    string         `gorm:"size:255" json:"location"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
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
	SortOrder  int            `gorm:"default:0" json:"sort_order"`
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
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:255" json:"title"`
	ImageUrl  string    `gorm:"size:255;not null" json:"image_url"`
	LinkUrl   string    `gorm:"size:255" json:"link_url"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Review 用户评价
type Review struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	Username   string     `gorm:"size:100;not null" json:"username"`
	Country    string     `gorm:"size:100" json:"country"`
	ReviewDate string     `gorm:"type:date" json:"review_date"`
	TourRoute  string     `gorm:"size:255" json:"tour_route"`
	Host       string     `gorm:"size:100" json:"host"`
	Content    string     `gorm:"type:text;not null" json:"content"`
	Avatar     string     `gorm:"size:255" json:"avatar"`
	Photos     StringList `gorm:"type:json" json:"photos"`
	Rating     int        `gorm:"default:5" json:"rating"` // 1-5 stars
	SortOrder  int        `gorm:"default:0" json:"sort_order"`
	IsActive   bool       `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
