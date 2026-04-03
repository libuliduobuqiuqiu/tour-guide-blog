//go:build integration

package routers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/spf13/viper"
)

func setupRouterIntegrationConfig(t *testing.T) {
	t.Helper()
	viper.Reset()
	t.Cleanup(viper.Reset)
	viper.Set("upload.path", t.TempDir())
	viper.Set("jwt.secret", "integration-secret")
	viper.Set("admin.username", "admin")
	viper.Set("admin.password", "admin123")
}

func TestLoginEndpointThroughRouter(t *testing.T) {
	setupRouterIntegrationConfig(t)
	r := InitRouter(false)

	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "admin123"})
	req := httptest.NewRequest(http.MethodPost, "/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d body=%s", w.Code, w.Body.String())
	}
}

func TestProtectedAPIRequiresAuthorization(t *testing.T) {
	setupRouterIntegrationConfig(t)
	r := InitRouter(false)

	req := httptest.NewRequest(http.MethodGet, "/api/admin/tours", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status: %d body=%s", w.Code, w.Body.String())
	}
}

func TestCORSPreflightForAllowedOrigin(t *testing.T) {
	setupRouterIntegrationConfig(t)
	r := InitRouter(false)

	req := httptest.NewRequest(http.MethodOptions, "/api/tours", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("unexpected status: %d body=%s", w.Code, w.Body.String())
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("unexpected cors origin: %q", got)
	}
}
