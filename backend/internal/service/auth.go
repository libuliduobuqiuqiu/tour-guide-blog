package service

import (
	"errors"
	"tour-guide-blog-backend/internal/model"

	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

var Auth = &AuthService{}

func (s *AuthService) Login(username, password string) (*model.Admin, string, error) {
	cfgUsername := viper.GetString("admin.username")
	cfgPassword := viper.GetString("admin.password")
	if cfgUsername == "" || cfgPassword == "" {
		return nil, "", errors.New("admin credentials not configured")
	}

	if username != cfgUsername {
		return nil, "", errors.New("invalid username or password")
	}

	if cfgPassword != password {
		if err := bcrypt.CompareHashAndPassword([]byte(cfgPassword), []byte(password)); err != nil {
			return nil, "", errors.New("invalid username or password")
		}
	}

	token, err := s.GenerateToken(cfgUsername)
	if err != nil {
		return nil, "", err
	}

	return &model.Admin{Username: cfgUsername}, token, nil
}
