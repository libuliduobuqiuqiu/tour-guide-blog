package service

import (
	"reflect"
	"testing"
	"tour-guide-blog-backend/internal/model"
)

func TestNormalizeRichTextHTMLRemovesEditorArtifacts(t *testing.T) {
	input := " <span style=\"color:red\" class=\"ql-size-large\">Day&nbsp;1<wbr></span>\u200b "

	got := normalizeRichTextHTML(input)

	if got != "Day 1" {
		t.Fatalf("normalizeRichTextHTML()=%q, want %q", got, "Day 1")
	}
}

func TestPrepareTourForSaveNormalizesDraftRoutePoints(t *testing.T) {
	tour := &model.Tour{
		Status:             " DRAFT ",
		CurrencySymbol:     " ¥ ",
		PriceSuffix:        " per person ",
		BookingTag:         " instant confirmation ",
		BookingNote:        " bring passport ",
		MinimumNotice:      " 24 hours ",
		CancellationPolicy: " free cancellation ",
		RoutePoints: model.TourRoutePoints{
			{
				Title:   " Stop & Go ",
				Content: " <span style=\"color:red\">Line&nbsp;1<wbr></span> ",
				Image:   " /uploads/route.jpg ",
			},
			{},
		},
	}

	prepareTourForSave(tour)

	if tour.Status != "draft" {
		t.Fatalf("unexpected status: %q", tour.Status)
	}
	if len(tour.RoutePoints) != 1 {
		t.Fatalf("unexpected route point count: %d", len(tour.RoutePoints))
	}
	point := tour.RoutePoints[0]
	if point.Title != "Stop & Go" || point.Content != "Line 1" || point.Image != "/uploads/route.jpg" {
		t.Fatalf("unexpected normalized route point: %#v", point)
	}
	if tour.Content != "<h2>Stop &amp; Go</h2>\nLine 1" {
		t.Fatalf("unexpected content: %q", tour.Content)
	}
	if tour.CurrencySymbol != "¥" ||
		tour.PriceSuffix != "per person" ||
		tour.BookingTag != "instant confirmation" ||
		tour.BookingNote != "bring passport" ||
		tour.MinimumNotice != "24 hours" ||
		tour.CancellationPolicy != "free cancellation" {
		t.Fatalf("unexpected trimmed fields: %#v", tour)
	}
}

func TestPrepareTourForSaveAllowsEmptyCurrencySymbol(t *testing.T) {
	tour := &model.Tour{
		Status:         "published",
		CurrencySymbol: "   ",
	}

	prepareTourForSave(tour)

	if tour.CurrencySymbol != "" {
		t.Fatalf("unexpected currency symbol: %q", tour.CurrencySymbol)
	}
}

func TestPrepareTourForSaveDefaultsToPublishedWithoutRoutePoints(t *testing.T) {
	tour := &model.Tour{
		Status:  " archived ",
		Content: "<p>keep me</p>",
	}

	prepareTourForSave(tour)

	if tour.Status != "published" {
		t.Fatalf("unexpected status: %q", tour.Status)
	}
	if tour.Content != "<p>keep me</p>" {
		t.Fatalf("unexpected content rewrite: %q", tour.Content)
	}
}

func TestDraftHelpersRoundTrip(t *testing.T) {
	original := &model.Tour{
		Title:              "Hidden draft",
		Description:        "desc",
		Content:            "<p>content</p>",
		RoutePoints:        model.TourRoutePoints{{Title: "A", Content: "B", Image: "/uploads/a.jpg"}},
		Highlights:         model.StringList{"highlight"},
		Places:             model.StringList{"place"},
		CurrencySymbol:     "EUR",
		PriceSuffix:        "per group",
		BookingTag:         "popular",
		BookingNote:        "note",
		MinimumNotice:      "48h",
		CancellationPolicy: "strict",
		MaxBookings:        8,
		Availability:       model.TourAvailability{{Date: "2026-05-01", BookedCount: 2, IsOpen: true}},
		CoverImage:         "/uploads/cover.jpg",
		Price:              199.5,
		Duration:           "3h",
		Location:           "Shanghai",
		IsActive:           true,
	}

	draft := buildDraftDataFromTour(original)
	working := *original

	clearPublishedTourContent(&working)
	if working.Title != "" || working.Description != "" || working.Content != "" || len(working.RoutePoints) != 0 {
		t.Fatalf("clearPublishedTourContent() did not clear core fields: %#v", working)
	}
	if working.Price != 0 || working.CoverImage != "" || working.Location != "" {
		t.Fatalf("clearPublishedTourContent() did not clear detail fields: %#v", working)
	}

	applyDraftData(&working, draft)
	roundTrip := buildDraftDataFromTour(&working)
	if !reflect.DeepEqual(roundTrip, draft) {
		t.Fatalf("draft round trip mismatch:\n got: %#v\nwant: %#v", roundTrip, draft)
	}
}

func TestMergeDraftIntoTour(t *testing.T) {
	tour := &model.Tour{
		Title:       "Published title",
		Description: "Published description",
		DraftData: model.TourDraftData{
			Title:       "Draft title",
			Description: "Draft description",
		},
	}

	mergeDraftIntoTour(tour)
	if tour.Title != "Draft title" || tour.Description != "Draft description" {
		t.Fatalf("mergeDraftIntoTour() did not apply draft: %#v", tour)
	}

	untouched := &model.Tour{Title: "Published title"}
	mergeDraftIntoTour(untouched)
	if untouched.Title != "Published title" {
		t.Fatalf("mergeDraftIntoTour() should keep title when draft is empty: %#v", untouched)
	}
}
