package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type ReviewService struct{}

var Review = &ReviewService{}

func (s *ReviewService) Create(item *model.Review) error {
	return query.Review.Create(item)
}

func (s *ReviewService) List() ([]*model.Review, error) {
	q := query.Review
	return q.Order(q.SortOrder.Asc(), q.CreatedAt.Desc()).Find()
}

func (s *ReviewService) ListActive() ([]*model.Review, error) {
	q := query.Review
	return q.Where(q.IsActive.Is(true)).Order(q.SortOrder.Asc(), q.CreatedAt.Desc()).Find()
}

func (s *ReviewService) Update(id uint, item *model.Review) error {
	q := query.Review
	_, err := q.Where(q.ID.Eq(id)).Updates(item)
	return err
}

func (s *ReviewService) Delete(id uint) error {
	q := query.Review
	_, err := q.Where(q.ID.Eq(id)).Delete()
	return err
}

// GenerateInitialReviews 生成初始评论
func (s *ReviewService) GenerateInitialReviews() error {
	count, err := query.Review.Count()
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	reviews := []*model.Review{
		{Username: "Alice Smith", Country: "United States", ReviewDate: "2025-01-05", TourRoute: "Old Town Highlights", Host: "Janet", Content: "Janet was amazing! The best tour guide in Chongqing.", Rating: 5, IsActive: true},
		{Username: "Bob Johnson", Country: "Canada", ReviewDate: "2025-01-11", TourRoute: "Street Food Discovery", Host: "Janet", Content: "Highly recommended. The food tour was incredible.", Rating: 5, IsActive: true},
		{Username: "Charlie Brown", Country: "United Kingdom", ReviewDate: "2025-01-23", TourRoute: "Riverside Culture Walk", Host: "Janet", Content: "Very knowledgeable and friendly. Made our trip special.", Rating: 5, IsActive: true},
		{Username: "David Wilson", Country: "Australia", ReviewDate: "2025-02-09", TourRoute: "Hidden Spots Day Tour", Host: "Janet", Content: "Great experience! Janet knows all the hidden spots.", Rating: 5, IsActive: true},
		{Username: "Eva Green", Country: "France", ReviewDate: "2025-02-14", TourRoute: "Chongqing One Day Tour", Host: "Janet", Content: "A wonderful day exploring the city. Thank you Janet!", Rating: 5, IsActive: true},
		{Username: "Frank Miller", Country: "Germany", ReviewDate: "2025-02-20", TourRoute: "Panda Reserve Route", Host: "Janet", Content: "The panda tour was the highlight of our trip.", Rating: 5, IsActive: true},
		{Username: "Grace Lee", Country: "Singapore", ReviewDate: "2025-03-02", TourRoute: "Historic District Walk", Host: "Janet", Content: "Excellent English and very professional.", Rating: 5, IsActive: true},
		{Username: "Henry Ford", Country: "United States", ReviewDate: "2025-03-13", TourRoute: "Museum + Culture Day", Host: "Janet", Content: "We learned so much about the history and culture.", Rating: 4, IsActive: true},
		{Username: "Ivy Chen", Country: "Malaysia", ReviewDate: "2025-03-22", TourRoute: "City Night Tour", Host: "Janet", Content: "Super fun and relaxed tour. Loved it!", Rating: 5, IsActive: true},
		{Username: "Jack White", Country: "Ireland", ReviewDate: "2025-04-01", TourRoute: "Custom Flexible Route", Host: "Janet", Content: "Janet is the best! Don't hesitate to book.", Rating: 5, IsActive: true},
	}

	return query.Review.Create(reviews...)
}
