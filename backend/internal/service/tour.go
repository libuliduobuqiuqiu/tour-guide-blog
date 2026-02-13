package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type TourService struct{}

var Tour = &TourService{}

func (s *TourService) List() ([]*model.Tour, error) {
	t := query.Tour
	return t.Order(t.CreatedAt.Desc()).Find()
}

func (s *TourService) GetByID(id uint) (*model.Tour, error) {
	t := query.Tour
	return t.Where(t.ID.Eq(id)).First()
}

func (s *TourService) Create(tour *model.Tour) error {
	return query.Tour.Create(tour)
}

func (s *TourService) Update(id uint, tour *model.Tour) error {
	t := query.Tour
	_, err := t.Where(t.ID.Eq(id)).Updates(tour)
	return err
}

func (s *TourService) Delete(id uint) error {
	t := query.Tour
	_, err := t.Where(t.ID.Eq(id)).Delete()
	return err
}
