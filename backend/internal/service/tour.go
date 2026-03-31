package service

import (
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gorm"
)

type TourService struct{}

var Tour = &TourService{}

func (s *TourService) List() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Order("sort_order ASC, created_at DESC").Find(&tours).Error
	return tours, err
}

func (s *TourService) ListLite() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Select(
		"id",
		"title",
		"description",
		"cover_image",
		"price",
		"duration",
		"location",
		"sort_order",
		"created_at",
		"updated_at",
	).Order("sort_order ASC, created_at DESC").Find(&tours).Error
	return tours, err
}

func (s *TourService) GetByID(id uint) (*model.Tour, error) {
	var tour model.Tour
	err := dao.DB.First(&tour, id).Error
	return &tour, err
}

func (s *TourService) Create(tour *model.Tour) error {
	return dao.DB.Create(tour).Error
}

func (s *TourService) Update(id uint, tour *model.Tour) error {
	return dao.DB.Model(&model.Tour{}).Where("id = ?", id).Updates(tour).Error
}

func (s *TourService) Delete(id uint) error {
	return dao.DB.Delete(&model.Tour{}, id).Error
}

func (s *TourService) Reorder(ids []uint) error {
	return dao.DB.Transaction(func(tx *gorm.DB) error {
		for index, id := range ids {
			if err := tx.Model(&model.Tour{}).Where("id = ?", id).Update("sort_order", index+1).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
