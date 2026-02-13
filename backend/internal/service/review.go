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
		{Username: "Alice Smith", Content: "Janet was amazing! The best tour guide in Chongqing.", Rating: 5, IsActive: true},
		{Username: "Bob Johnson", Content: "Highly recommended. The food tour was incredible.", Rating: 5, IsActive: true},
		{Username: "Charlie Brown", Content: "Very knowledgeable and friendly. Made our trip special.", Rating: 5, IsActive: true},
		{Username: "David Wilson", Content: "Great experience! Janet knows all the hidden spots.", Rating: 5, IsActive: true},
		{Username: "Eva Green", Content: "A wonderful day exploring the city. Thank you Janet!", Rating: 5, IsActive: true},
		{Username: "Frank Miller", Content: "The panda tour was the highlight of our trip.", Rating: 5, IsActive: true},
		{Username: "Grace Lee", Content: "Excellent English and very professional.", Rating: 5, IsActive: true},
		{Username: "Henry Ford", Content: "We learned so much about the history and culture.", Rating: 4, IsActive: true},
		{Username: "Ivy Chen", Content: "Super fun and relaxed tour. Loved it!", Rating: 5, IsActive: true},
		{Username: "Jack White", Content: "Janet is the best! Don't hesitate to book.", Rating: 5, IsActive: true},
	}

	return query.Review.Create(reviews...)
}
