package service

import (
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

func resetViper(t *testing.T) {
	t.Helper()
	viper.Reset()
	t.Cleanup(viper.Reset)
}

func TestAuthLoginWithPlainPassword(t *testing.T) {
	resetViper(t)
	viper.Set("admin.username", "admin")
	viper.Set("admin.password", "admin123")
	viper.Set("jwt.secret", "test-secret")
	viper.Set("jwt.expire_hours", 1)

	admin, token, err := Auth.Login("admin", "admin123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if admin == nil || admin.Username != "admin" {
		t.Fatalf("unexpected admin: %#v", admin)
	}
	if token == "" {
		t.Fatal("expected token, got empty string")
	}
}

func TestAuthLoginWithBcryptPassword(t *testing.T) {
	resetViper(t)
	viper.Set("admin.username", "admin")
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to generate hash: %v", err)
	}
	viper.Set("admin.password", string(hash))
	viper.Set("jwt.secret", "test-secret")

	_, _, err = Auth.Login("admin", "admin123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAuthLoginInvalidCredentials(t *testing.T) {
	resetViper(t)
	viper.Set("admin.username", "admin")
	viper.Set("admin.password", "admin123")
	viper.Set("jwt.secret", "test-secret")

	_, _, err := Auth.Login("admin", "wrong")
	if err == nil {
		t.Fatal("expected invalid credentials error")
	}
}

func TestParseTokenRejectsWrongSigningMethod(t *testing.T) {
	resetViper(t)
	viper.Set("jwt.secret", "test-secret")

	claims := jwt.RegisteredClaims{Subject: "admin"}
	token := jwt.NewWithClaims(jwt.SigningMethodHS384, claims)
	tokenStr, err := token.SignedString([]byte("test-secret"))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	if _, err := Auth.ParseToken(tokenStr); err == nil {
		t.Fatal("expected parse error for wrong signing method")
	}
}
