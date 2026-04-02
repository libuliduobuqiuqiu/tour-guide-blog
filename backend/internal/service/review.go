package service

import (
	"errors"
	"strings"
	"time"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gorm"
)

type ReviewService struct{}

var Review = &ReviewService{}

func (s *ReviewService) Create(item *model.Review) error {
	item.Username = strings.TrimSpace(item.Username)
	item.Country = strings.TrimSpace(item.Country)
	item.Content = strings.TrimSpace(item.Content)
	item.TourRoute = strings.TrimSpace(item.TourRoute)
	item.Host = strings.TrimSpace(item.Host)

	if item.SortOrder <= 0 {
		next, err := s.nextSortOrder()
		if err != nil {
			return err
		}
		item.SortOrder = next
	}

	if item.ReviewDate == "" {
		item.ReviewDate = time.Now().Format("2006-01-02")
	}

	return dao.DB.Select("*").Create(item).Error
}

func (s *ReviewService) List() ([]*model.Review, error) {
	var reviews []*model.Review
	err := dao.DB.Order("sort_order asc").Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func (s *ReviewService) ListActive() ([]*model.Review, error) {
	var reviews []*model.Review
	err := dao.DB.Where("is_active = ?", true).Order("sort_order asc").Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func (s *ReviewService) Update(id uint, item *model.Review) error {
	item.ID = id
	item.Username = strings.TrimSpace(item.Username)
	item.Country = strings.TrimSpace(item.Country)
	item.Content = strings.TrimSpace(item.Content)
	item.TourRoute = strings.TrimSpace(item.TourRoute)
	item.Host = strings.TrimSpace(item.Host)

	if item.SortOrder <= 0 {
		current, err := s.GetByID(id)
		if err != nil {
			return err
		}
		item.SortOrder = current.SortOrder
	}

	return dao.DB.Model(&model.Review{}).
		Where("id = ?", id).
		Select("*").
		Omit("id", "created_at").
		Updates(item).Error
}

func (s *ReviewService) GetByID(id uint) (*model.Review, error) {
	var review model.Review
	if err := dao.DB.First(&review, id).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func (s *ReviewService) Delete(id uint) error {
	return dao.DB.Delete(&model.Review{}, id).Error
}

func (s *ReviewService) SetDashboardVisible(id uint, visible bool) error {
	return dao.DB.Model(&model.Review{}).
		Where("id = ?", id).
		Update("show_on_dashboard", visible).Error
}

func (s *ReviewService) Reorder(ids []uint) error {
	if len(ids) == 0 {
		return errors.New("no review ids provided")
	}

	return dao.DB.Transaction(func(tx *gorm.DB) error {
		for index, id := range ids {
			if err := tx.Model(&model.Review{}).Where("id = ?", id).Update("sort_order", index+1).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *ReviewService) nextSortOrder() (int, error) {
	var last model.Review
	err := dao.DB.Order("sort_order desc").Order("id desc").First(&last).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return 1, nil
	}
	if err != nil {
		return 0, err
	}
	if last.SortOrder <= 0 {
		return int(last.ID) + 1, nil
	}
	return last.SortOrder + 1, nil
}

// GenerateInitialReviews 生成初始评论
func (s *ReviewService) GenerateInitialReviews() error {
	var count int64
	if err := dao.DB.Model(&model.Review{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	reviews := []*model.Review{
		{Username: "Alice Smith", Country: "United States", ReviewDate: "2025-01-05", TourRoute: "Old Town Highlights", Host: "Janet", Content: "Janet was amazing! The best tour guide in Chongqing.", Rating: 5, SortOrder: 1, IsActive: true},
		{Username: "Bob Johnson", Country: "Canada", ReviewDate: "2025-01-11", TourRoute: "Street Food Discovery", Host: "Janet", Content: "Highly recommended. The food tour was incredible.", Rating: 5, SortOrder: 2, IsActive: true},
		{Username: "Charlie Brown", Country: "United Kingdom", ReviewDate: "2025-01-23", TourRoute: "Riverside Culture Walk", Host: "Janet", Content: "Very knowledgeable and friendly. Made our trip special.", Rating: 5, SortOrder: 3, IsActive: true},
		{Username: "David Wilson", Country: "Australia", ReviewDate: "2025-02-09", TourRoute: "Hidden Spots Day Tour", Host: "Janet", Content: "Great experience! Janet knows all the hidden spots.", Rating: 5, SortOrder: 4, IsActive: true},
		{Username: "Eva Green", Country: "France", ReviewDate: "2025-02-14", TourRoute: "Chongqing One Day Tour", Host: "Janet", Content: "A wonderful day exploring the city. Thank you Janet!", Rating: 5, SortOrder: 5, IsActive: true},
		{Username: "Frank Miller", Country: "Germany", ReviewDate: "2025-02-20", TourRoute: "Panda Reserve Route", Host: "Janet", Content: "The panda tour was the highlight of our trip.", Rating: 5, SortOrder: 6, IsActive: true},
		{Username: "Grace Lee", Country: "Singapore", ReviewDate: "2025-03-02", TourRoute: "Historic District Walk", Host: "Janet", Content: "Excellent English and very professional.", Rating: 5, SortOrder: 7, IsActive: true},
		{Username: "Henry Ford", Country: "United States", ReviewDate: "2025-03-13", TourRoute: "Museum + Culture Day", Host: "Janet", Content: "We learned so much about the history and culture.", Rating: 4, SortOrder: 8, IsActive: true},
		{Username: "Ivy Chen", Country: "Malaysia", ReviewDate: "2025-03-22", TourRoute: "City Night Tour", Host: "Janet", Content: "Super fun and relaxed tour. Loved it!", Rating: 5, SortOrder: 9, IsActive: true},
		{Username: "Jack White", Country: "Ireland", ReviewDate: "2025-04-01", TourRoute: "Custom Flexible Route", Host: "Janet", Content: "Janet is the best! Don't hesitate to book.", Rating: 5, SortOrder: 10, IsActive: true},
	}

	return dao.DB.Create(reviews).Error
}
