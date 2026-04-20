package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestIsAllowedSocialImageHost(t *testing.T) {
	tests := []struct {
		host string
		want bool
	}{
		{host: "cdninstagram.com", want: true},
		{host: "subdomain.fna.fbcdn.net", want: true},
		{host: "video-cdn.tiktokcdn.com", want: true},
		{host: "localhost", want: false},
		{host: "internal.local", want: false},
		{host: "127.0.0.1", want: false},
		{host: "10.0.0.8", want: false},
		{host: "example.com", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.host, func(t *testing.T) {
			if got := isAllowedSocialImageHost(tt.host); got != tt.want {
				t.Fatalf("isAllowedSocialImageHost(%q)=%v, want %v", tt.host, got, tt.want)
			}
		})
	}
}

func TestProxySocialImageRejectsInvalidInput(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/proxy", ProxySocialImage)

	tests := []struct {
		name           string
		target         string
		wantStatusCode int
		wantBody       string
	}{
		{
			name:           "missing url",
			target:         "/proxy",
			wantStatusCode: http.StatusBadRequest,
			wantBody:       "url is required",
		},
		{
			name:           "disallowed host",
			target:         "/proxy?url=https://example.com/image.jpg",
			wantStatusCode: http.StatusBadRequest,
			wantBody:       "image host is not allowed",
		},
		{
			name:           "invalid scheme",
			target:         "/proxy?url=file:///tmp/image.jpg",
			wantStatusCode: http.StatusBadRequest,
			wantBody:       "invalid image url",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tt.target, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.wantStatusCode {
				t.Fatalf("unexpected status: %d body=%s", w.Code, w.Body.String())
			}
			if !strings.Contains(w.Body.String(), tt.wantBody) {
				t.Fatalf("unexpected body: %s", w.Body.String())
			}
		})
	}
}
