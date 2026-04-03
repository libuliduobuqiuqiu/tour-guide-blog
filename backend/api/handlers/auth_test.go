package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func resetLoginRateState() {
	loginRateMu.Lock()
	defer loginRateMu.Unlock()
	loginRateEntries = map[string]loginRateEntry{}
}

func TestAllowLoginAttemptRateLimit(t *testing.T) {
	resetLoginRateState()
	for i := 0; i < loginRateLimit; i++ {
		if !allowLoginAttempt("1.2.3.4") {
			t.Fatalf("attempt %d should be allowed", i+1)
		}
	}
	if allowLoginAttempt("1.2.3.4") {
		t.Fatal("expected attempt beyond limit to be blocked")
	}
}

func TestAllowLoginAttemptWindowReset(t *testing.T) {
	resetLoginRateState()
	loginRateMu.Lock()
	loginRateEntries["1.2.3.4"] = loginRateEntry{Count: loginRateLimit, WindowEnd: time.Now().Add(-time.Minute)}
	loginRateMu.Unlock()

	if !allowLoginAttempt("1.2.3.4") {
		t.Fatal("expected attempt to be allowed after expired window")
	}
}

func TestLoginSuccess(t *testing.T) {
	resetLoginRateState()
	viper.Reset()
	defer viper.Reset()
	viper.Set("admin.username", "admin")
	viper.Set("admin.password", "admin123")
	viper.Set("jwt.secret", "test-secret")

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", Login)

	body, _ := json.Marshal(LoginRequest{Username: "admin", Password: "admin123"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d, body=%s", w.Code, w.Body.String())
	}
}

func TestLoginRateLimited(t *testing.T) {
	resetLoginRateState()
	viper.Reset()
	defer viper.Reset()
	viper.Set("admin.username", "admin")
	viper.Set("admin.password", "admin123")
	viper.Set("jwt.secret", "test-secret")

	loginRateMu.Lock()
	loginRateEntries["192.0.2.1"] = loginRateEntry{Count: loginRateLimit, WindowEnd: time.Now().Add(loginRateWindow)}
	loginRateMu.Unlock()

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", Login)

	body, _ := json.Marshal(LoginRequest{Username: "admin", Password: "admin123"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-For", "192.0.2.1")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("unexpected status: %d, body=%s", w.Code, w.Body.String())
	}
}
