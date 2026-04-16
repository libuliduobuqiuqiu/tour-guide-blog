package service

import (
	"html"
	"regexp"
	"strings"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gorm"
)

type TourService struct{}

var Tour = &TourService{}

var richTextContentCleaner = strings.NewReplacer(
	"&nbsp;", " ",
	"&NBSP;", " ",
	"&#160;", " ",
	"\u00a0", " ",
	"\u00ad", "",
	"&#173;", "",
	"\u200b", "",
	"\u200c", "",
	"\u200d", "",
	"\ufeff", "",
)

var richTextStyleAttrPattern = regexp.MustCompile(`\sstyle\s*=\s*"[^"]*"|\sstyle\s*=\s*'[^']*'|\sstyle\s*=\s*[^\s>]+`)
var richTextClassAttrPattern = regexp.MustCompile(`\sclass\s*=\s*"[^"]*"|\sclass\s*=\s*'[^']*'|\sclass\s*=\s*[^\s>]+`)
var richTextSpanPattern = regexp.MustCompile(`</?span[^>]*>`)
var richTextWbrPattern = regexp.MustCompile(`<wbr\s*/?>`)

func normalizeRichTextHTML(content string) string {
	normalized := strings.TrimSpace(content)
	normalized = richTextContentCleaner.Replace(normalized)
	normalized = richTextWbrPattern.ReplaceAllString(normalized, "")
	normalized = richTextStyleAttrPattern.ReplaceAllString(normalized, "")
	normalized = richTextClassAttrPattern.ReplaceAllString(normalized, "")
	normalized = richTextSpanPattern.ReplaceAllString(normalized, "")
	return normalized
}

func buildDraftDataFromTour(tour *model.Tour) model.TourDraftData {
	return model.TourDraftData{
		Title:              tour.Title,
		Description:        tour.Description,
		Content:            tour.Content,
		RoutePoints:        tour.RoutePoints,
		Highlights:         tour.Highlights,
		Places:             tour.Places,
		PriceSuffix:        tour.PriceSuffix,
		BookingTag:         tour.BookingTag,
		BookingNote:        tour.BookingNote,
		MinimumNotice:      tour.MinimumNotice,
		CancellationPolicy: tour.CancellationPolicy,
		MaxBookings:        tour.MaxBookings,
		Availability:       tour.Availability,
		CoverImage:         tour.CoverImage,
		Price:              tour.Price,
		Duration:           tour.Duration,
		Location:           tour.Location,
	}
}

func clearPublishedTourContent(tour *model.Tour) {
	tour.Title = ""
	tour.Description = ""
	tour.Content = ""
	tour.RoutePoints = model.TourRoutePoints{}
	tour.Highlights = model.StringList{}
	tour.Places = model.StringList{}
	tour.PriceSuffix = ""
	tour.BookingTag = ""
	tour.BookingNote = ""
	tour.MinimumNotice = ""
	tour.CancellationPolicy = ""
	tour.MaxBookings = 0
	tour.Availability = model.TourAvailability{}
	tour.CoverImage = ""
	tour.Price = 0
	tour.Duration = ""
	tour.Location = ""
}

func applyDraftData(tour *model.Tour, draft model.TourDraftData) {
	tour.Title = draft.Title
	tour.Description = draft.Description
	tour.Content = draft.Content
	tour.RoutePoints = draft.RoutePoints
	tour.Highlights = draft.Highlights
	tour.Places = draft.Places
	tour.PriceSuffix = draft.PriceSuffix
	tour.BookingTag = draft.BookingTag
	tour.BookingNote = draft.BookingNote
	tour.MinimumNotice = draft.MinimumNotice
	tour.CancellationPolicy = draft.CancellationPolicy
	tour.MaxBookings = draft.MaxBookings
	tour.Availability = draft.Availability
	tour.CoverImage = draft.CoverImage
	tour.Price = draft.Price
	tour.Duration = draft.Duration
	tour.Location = draft.Location
}

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
		content := normalizeRichTextHTML(point.Content)
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
	tour.PriceSuffix = strings.TrimSpace(tour.PriceSuffix)
	tour.BookingTag = strings.TrimSpace(tour.BookingTag)
	tour.BookingNote = strings.TrimSpace(tour.BookingNote)
	tour.MinimumNotice = strings.TrimSpace(tour.MinimumNotice)
	tour.CancellationPolicy = strings.TrimSpace(tour.CancellationPolicy)
	switch strings.ToLower(strings.TrimSpace(tour.Status)) {
	case "draft":
		tour.Status = "draft"
	default:
		tour.Status = "published"
	}
}

func mergeDraftIntoTour(tour *model.Tour) {
	if tour.DraftData.IsZero() {
		return
	}
	applyDraftData(tour, tour.DraftData)
}

func (s *TourService) ListPublished() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Where("status = ? OR (status = ? AND title <> '')", "published", "draft").
		Order("sort_order ASC, created_at DESC").
		Find(&tours).Error
	return tours, err
}

func (s *TourService) ListAll() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Order("sort_order ASC, created_at DESC").Find(&tours).Error
	return tours, err
}

func (s *TourService) ListLitePublished() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Select(
		"id",
		"title",
		"description",
		"route_points",
		"price_suffix",
		"booking_tag_1",
		"booking_tag_2",
		"minimum_notice",
		"cancellation_policy",
		"max_bookings",
		"availability",
		"cover_image",
		"price",
		"duration",
		"location",
		"status",
		"sort_order",
		"created_at",
		"updated_at",
	).Where("status = ? OR (status = ? AND title <> '')", "published", "draft").
		Order("sort_order ASC, created_at DESC").
		Find(&tours).Error
	return tours, err
}

func (s *TourService) ListLiteAll() ([]*model.Tour, error) {
	var tours []*model.Tour
	err := dao.DB.Select(
		"id",
		"title",
		"description",
		"route_points",
		"price_suffix",
		"booking_tag_1",
		"booking_tag_2",
		"minimum_notice",
		"cancellation_policy",
		"max_bookings",
		"availability",
		"cover_image",
		"price",
		"duration",
		"location",
		"status",
		"draft_data",
		"sort_order",
		"created_at",
		"updated_at",
	).Order("sort_order ASC, created_at DESC").Find(&tours).Error
	if err != nil {
		return nil, err
	}
	for _, tour := range tours {
		mergeDraftIntoTour(tour)
	}
	return tours, err
}

func (s *TourService) GetByID(id uint) (*model.Tour, error) {
	var tour model.Tour
	err := dao.DB.First(&tour, id).Error
	return &tour, err
}

func (s *TourService) GetAdminByID(id uint) (*model.Tour, error) {
	var tour model.Tour
	if err := dao.DB.First(&tour, id).Error; err != nil {
		return nil, err
	}
	mergeDraftIntoTour(&tour)
	return &tour, nil
}

func (s *TourService) GetPublishedByID(id uint) (*model.Tour, error) {
	var tour model.Tour
	err := dao.DB.Where("(status = ? OR (status = ? AND title <> '')) AND id = ?", "published", "draft", id).First(&tour).Error
	return &tour, err
}

func (s *TourService) Create(tour *model.Tour) error {
	prepareTourForSave(tour)
	if tour.Status == "draft" {
		tour.DraftData = buildDraftDataFromTour(tour)
		clearPublishedTourContent(tour)
	}
	return dao.DB.Create(tour).Error
}

func (s *TourService) Update(id uint, tour *model.Tour) error {
	prepareTourForSave(tour)
	var existing model.Tour
	if err := dao.DB.First(&existing, id).Error; err != nil {
		return err
	}

	if tour.Status == "draft" {
		draft := buildDraftDataFromTour(tour)
		updates := map[string]interface{}{
			"status":     "draft",
			"draft_data": draft,
		}
		if existing.Status == "draft" && strings.TrimSpace(existing.Title) == "" {
			updates["title"] = ""
			updates["description"] = ""
			updates["content"] = ""
			updates["route_points"] = model.TourRoutePoints{}
			updates["highlights"] = model.StringList{}
			updates["places"] = model.StringList{}
			updates["price_suffix"] = ""
			updates["booking_tag_1"] = ""
			updates["booking_tag_2"] = ""
			updates["minimum_notice"] = ""
			updates["cancellation_policy"] = ""
			updates["max_bookings"] = 0
			updates["availability"] = model.TourAvailability{}
			updates["cover_image"] = ""
			updates["price"] = 0
			updates["duration"] = ""
			updates["location"] = ""
		}
		return dao.DB.Model(&model.Tour{}).Where("id = ?", id).Updates(updates).Error
	}

	updates := map[string]interface{}{
		"title":               tour.Title,
		"description":         tour.Description,
		"content":             tour.Content,
		"route_points":        tour.RoutePoints,
		"highlights":          tour.Highlights,
		"places":              tour.Places,
		"price_suffix":        tour.PriceSuffix,
		"booking_tag_1":       tour.BookingTag,
		"booking_tag_2":       tour.BookingNote,
		"minimum_notice":      tour.MinimumNotice,
		"cancellation_policy": tour.CancellationPolicy,
		"max_bookings":        tour.MaxBookings,
		"availability":        tour.Availability,
		"cover_image":         tour.CoverImage,
		"price":               tour.Price,
		"duration":            tour.Duration,
		"location":            tour.Location,
		"status":              tour.Status,
		"draft_data":          nil,
	}
	return dao.DB.Model(&model.Tour{}).Where("id = ?", id).Updates(updates).Error
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
