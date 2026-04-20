package handlers

import (
	"reflect"
	"testing"
)

func TestValidateReviewPhotoURLsNormalizesAndDeduplicates(t *testing.T) {
	got, err := validateReviewPhotoURLs([]string{
		" /uploads/a.jpg ",
		"/uploads/a.jpg",
		"/uploads/b.jpg ",
	})
	if err != nil {
		t.Fatalf("validateReviewPhotoURLs() returned error: %v", err)
	}

	want := []string{"/uploads/a.jpg", "/uploads/b.jpg"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("validateReviewPhotoURLs()=%v, want %v", got, want)
	}
}

func TestValidateReviewPhotoURLsRejectsUnsupportedURL(t *testing.T) {
	if _, err := validateReviewPhotoURLs([]string{"https://example.com/a.jpg"}); err == nil {
		t.Fatal("expected unsupported photo url error")
	}
}

func TestValidateReviewPhotoURLsRejectsTooManyDistinctPhotos(t *testing.T) {
	_, err := validateReviewPhotoURLs([]string{
		"/uploads/1.jpg",
		"/uploads/2.jpg",
		"/uploads/3.jpg",
		"/uploads/4.jpg",
	})
	if err == nil {
		t.Fatal("expected too many photos error")
	}
}
