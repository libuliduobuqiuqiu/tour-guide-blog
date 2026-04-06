package service

import (
	"html"
	"strings"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gorm"
)

type TourService struct{}

var Tour = &TourService{}

func buildTourContentFromRoutePoints(points model.TourRoutePoints) string {
	if len(points) == 0 {
		return ""
	}

	var builder strings.Builder
	for _, point := range points {
		title := strings.TrimSpace(point.Title)
		content := strings.TrimSpace(point.Content)
		if title == "" && content == "" {
			continue
		}

		if builder.Len() > 0 {
			builder.WriteString("\n")
		}

		if title != "" {
			builder.WriteString("<h2>")
			builder.WriteString(html.EscapeString(title))
			builder.WriteString("</h2>\n")
		}

		if content != "" {
			builder.WriteString(content)
			builder.WriteString("\n")
		}
	}

	return strings.TrimSpace(builder.String())
}

func normalizeTourRoutePoints(points model.TourRoutePoints) model.TourRoutePoints {
	normalized := make(model.TourRoutePoints, 0, len(points))
	for _, point := range points {
		title := strings.TrimSpace(point.Title)
		content := strings.TrimSpace(point.Content)
		image := strings.TrimSpace(point.Image)
		if title == "" && content == "" && image == "" {
			continue
		}
		normalized = append(normalized, model.TourRoutePoint{
			Title:   title,
			Content: content,
			Image:   image,
		})
	}
	return normalized
}

func prepareTourForSave(tour *model.Tour) {
	tour.RoutePoints = normalizeTourRoutePoints(tour.RoutePoints)
	if len(tour.RoutePoints) > 0 {
		tour.Content = buildTourContentFromRoutePoints(tour.RoutePoints)
	}
}

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
		"route_points",
		"booking_tag_2",
		"max_bookings",
		"availability",
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
	prepareTourForSave(tour)
	return dao.DB.Create(tour).Error
}

func (s *TourService) Update(id uint, tour *model.Tour) error {
	prepareTourForSave(tour)
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
