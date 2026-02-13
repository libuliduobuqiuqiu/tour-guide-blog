package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type CarouselService struct{}

var Carousel = &CarouselService{}

func (s *CarouselService) Create(item *model.Carousel) error {
	return query.Carousel.Create(item)
}

func (s *CarouselService) List() ([]*model.Carousel, error) {
	q := query.Carousel
	return q.Order(q.SortOrder.Asc(), q.CreatedAt.Desc()).Find()
}

func (s *CarouselService) ListActive() ([]*model.Carousel, error) {
	q := query.Carousel
	return q.Where(q.IsActive.Is(true)).Order(q.SortOrder.Asc(), q.CreatedAt.Desc()).Find()
}

func (s *CarouselService) Update(id uint, item *model.Carousel) error {
	q := query.Carousel
	_, err := q.Where(q.ID.Eq(id)).Updates(item)
	return err
}

func (s *CarouselService) Delete(id uint) error {
	q := query.Carousel
	_, err := q.Where(q.ID.Eq(id)).Delete()
	return err
}

func (s *CarouselService) Get(id uint) (*model.Carousel, error) {
	q := query.Carousel
	return q.Where(q.ID.Eq(id)).First()
}
