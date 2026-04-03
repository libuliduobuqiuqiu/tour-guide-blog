package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"tour-guide-blog-backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func setupAuthTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/protected", Auth(), func(c *gin.Context) {
		username, _ := c.Get("admin_username")
		c.JSON(http.StatusOK, gin.H{"username": username})
	})
	return r
}

func TestAuthMiddlewareMissingHeader(t *testing.T) {
	viper.Reset()
	defer viper.Reset()
	r := setupAuthTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status: %d", w.Code)
	}
}

func TestAuthMiddlewareInvalidToken(t *testing.T) {
	viper.Reset()
	defer viper.Reset()
	viper.Set("jwt.secret", "test-secret")
	r := setupAuthTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer not-a-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status: %d", w.Code)
	}
}

func TestAuthMiddlewareValidToken(t *testing.T) {
	viper.Reset()
	defer viper.Reset()
	viper.Set("jwt.secret", "test-secret")

	token, err := service.Auth.GenerateToken("admin")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	r := setupAuthTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d, body=%s", w.Code, w.Body.String())
	}
}
