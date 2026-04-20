package routers

import (
	"testing"

	"github.com/spf13/viper"
)

func resetRouterConfig(t *testing.T) {
	t.Helper()
	viper.Reset()
	t.Cleanup(viper.Reset)
}

func TestIsAllowedCORSOriginAllowsDefaultsAndConfiguredOrigins(t *testing.T) {
	resetRouterConfig(t)
	viper.Set("server.frontend_origin", "https://cms.example.com")
	t.Setenv("FRONTEND_ORIGIN", "https://app.example.com")

	tests := []struct {
		name   string
		origin string
	}{
		{name: "localhost default", origin: "http://localhost:3000"},
		{name: "loopback default", origin: "http://127.0.0.1:3000"},
		{name: "configured by viper", origin: "https://cms.example.com"},
		{name: "configured by env", origin: "https://app.example.com"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if !isAllowedCORSOrigin(tt.origin) {
				t.Fatalf("expected origin %q to be allowed", tt.origin)
			}
		})
	}
}

func TestIsAllowedCORSOriginRejectsInvalidOrUnlistedOrigins(t *testing.T) {
	resetRouterConfig(t)

	tests := []string{
		"",
		"not a url",
		"/relative",
		"http://localhost:4000",
		"https://evil.example.com",
	}

	for _, origin := range tests {
		t.Run(origin, func(t *testing.T) {
			if isAllowedCORSOrigin(origin) {
				t.Fatalf("expected origin %q to be rejected", origin)
			}
		})
	}
}
