package handlers

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func newMultipartFileHeader(t *testing.T, filename string, content []byte) *multipart.FileHeader {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		t.Fatalf("CreateFormFile() error: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		t.Fatalf("Write() error: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if err := req.ParseMultipartForm(int64(body.Len()) + 1024); err != nil {
		t.Fatalf("ParseMultipartForm() error: %v", err)
	}

	files := req.MultipartForm.File["file"]
	if len(files) != 1 {
		t.Fatalf("unexpected file count: %d", len(files))
	}
	return files[0]
}

func TestDetectUploadedContentType(t *testing.T) {
	pngHeader := newMultipartFileHeader(t, "image.png", append(
		[]byte{0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n'},
		bytes.Repeat([]byte{0}, 32)...,
	))

	got, err := detectUploadedContentType(pngHeader)
	if err != nil {
		t.Fatalf("detectUploadedContentType() returned error: %v", err)
	}
	if got != "image/png" {
		t.Fatalf("detectUploadedContentType()=%q, want %q", got, "image/png")
	}

	textHeader := newMultipartFileHeader(t, "note.txt", []byte("plain text"))
	got, err = detectUploadedContentType(textHeader)
	if err != nil {
		t.Fatalf("detectUploadedContentType() returned error: %v", err)
	}
	if !strings.HasPrefix(got, "text/plain") {
		t.Fatalf("detectUploadedContentType()=%q, want prefix %q", got, "text/plain")
	}
}

func TestIsAllowedUploadContentType(t *testing.T) {
	tests := []struct {
		name        string
		ext         string
		contentType string
		want        bool
	}{
		{name: "png", ext: ".png", contentType: "image/png", want: true},
		{name: "jpeg with parameters", ext: ".jpg", contentType: "image/jpeg; charset=binary", want: true},
		{name: "legacy jpg", ext: ".jpg", contentType: "image/jpg", want: true},
		{name: "mismatch", ext: ".png", contentType: "image/jpeg", want: false},
		{name: "unsupported ext", ext: ".svg", contentType: "image/svg+xml", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isAllowedUploadContentType(tt.ext, tt.contentType); got != tt.want {
				t.Fatalf("isAllowedUploadContentType(%q, %q)=%v, want %v", tt.ext, tt.contentType, got, tt.want)
			}
		})
	}
}
