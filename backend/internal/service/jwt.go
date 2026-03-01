package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

func (s *AuthService) GenerateToken(username string) (string, error) {
	secret, err := s.jwtSecret()
	if err != nil {
		return "", err
	}

	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   username,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.tokenExpiry())),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

func (s *AuthService) ParseToken(tokenStr string) (*jwt.RegisteredClaims, error) {
	secret, err := s.jwtSecret()
	if err != nil {
		return nil, err
	}

	parsed, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("invalid token signing method")
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok || !parsed.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (s *AuthService) jwtSecret() ([]byte, error) {
	secret := viper.GetString("jwt.secret")
	if secret == "" {
		return nil, errors.New("jwt secret not configured")
	}
	return []byte(secret), nil
}

func (s *AuthService) tokenExpiry() time.Duration {
	hours := viper.GetInt("jwt.expire_hours")
	if hours <= 0 {
		hours = 24
	}
	return time.Duration(hours) * time.Hour
}
