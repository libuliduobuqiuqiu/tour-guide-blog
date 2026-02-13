package service

import (
	"errors"
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

var Auth = &AuthService{}

func (s *AuthService) Login(username, password string) (*model.Admin, string, error) {
	// 特殊处理默认管理员 (如果是 admin/admin 则登录成功)
	// 注意：在实际生产环境中，这种硬编码应该移除，且所有密码都应加密存储
	if username == "admin" && password == "admin" {
		return &model.Admin{Username: "admin"}, "mock-token", nil
	}

	a := query.Admin
	admin, err := a.Where(a.Username.Eq(username)).First()
	if err != nil {
		return nil, "", errors.New("invalid username or password")
	}

	// 校验密码
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password)); err != nil {
		// 如果 bcrypt 失败，尝试直接比较（兼容旧的明文密码，但应逐步淘汰）
		if admin.Password == password {
			return admin, "mock-token", nil
		}
		return nil, "", errors.New("invalid username or password")
	}

	return admin, "mock-token", nil
}
