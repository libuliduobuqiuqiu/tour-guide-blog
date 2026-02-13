package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type ConfigService struct{}

var Config = &ConfigService{}

func (s *ConfigService) GetByKey(key string) (*model.Config, error) {
	config := query.Config
	return config.Where(config.Key.Eq(key)).First()
}

func (s *ConfigService) Update(key string, value string) error {
	config := query.Config
	_, err := config.Where(config.Key.Eq(key)).First()
	if err != nil {
		// 不存在则创建
		return config.Create(&model.Config{Key: key, Value: value})
	}
	// 存在则更新
	_, err = config.Where(config.Key.Eq(key)).Update(config.Value, value)
	return err
}

func (s *ConfigService) GetAbout() (*model.Config, error) {
	return s.GetByKey("about")
}
