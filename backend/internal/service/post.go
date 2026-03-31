package service

import (
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gorm"
)

type PostService struct{}

var Post = &PostService{}

func (s *PostService) List(tag string) ([]*model.Post, error) {
	q := dao.DB.Order("sort_order ASC, created_at DESC")
	if tag != "" {
		q = q.Where("tags LIKE ?", "%"+tag+"%")
	}
	var posts []*model.Post
	err := q.Find(&posts).Error
	return posts, err
}

func (s *PostService) ListLite(tag string) ([]*model.Post, error) {
	q := dao.DB.Select(
		"id",
		"title",
		"summary",
		"author",
		"cover_image",
		"category",
		"tags",
		"sort_order",
		"created_at",
		"updated_at",
	).Order("sort_order ASC, created_at DESC")
	if tag != "" {
		q = q.Where("tags LIKE ?", "%"+tag+"%")
	}
	var posts []*model.Post
	err := q.Find(&posts).Error
	return posts, err
}

func (s *PostService) GetByID(id uint) (*model.Post, error) {
	var post model.Post
	err := dao.DB.First(&post, id).Error
	return &post, err
}

func (s *PostService) Create(post *model.Post) error {
	return dao.DB.Create(post).Error
}

func (s *PostService) Update(id uint, post *model.Post) error {
	return dao.DB.Model(&model.Post{}).Where("id = ?", id).Updates(post).Error
}

func (s *PostService) Delete(id uint) error {
	return dao.DB.Delete(&model.Post{}, id).Error
}

func (s *PostService) Reorder(ids []uint) error {
	return dao.DB.Transaction(func(tx *gorm.DB) error {
		for index, id := range ids {
			if err := tx.Model(&model.Post{}).Where("id = ?", id).Update("sort_order", index+1).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
