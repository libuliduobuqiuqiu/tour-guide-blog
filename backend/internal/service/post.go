package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type PostService struct{}

var Post = &PostService{}

func (s *PostService) List(tag string) ([]*model.Post, error) {
	p := query.Post
	q := p.Order(p.CreatedAt.Desc())
	if tag != "" {
		q = q.Where(p.Tags.Like("%" + tag + "%"))
	}
	return q.Find()
}

func (s *PostService) GetByID(id uint) (*model.Post, error) {
	p := query.Post
	return p.Where(p.ID.Eq(id)).First()
}

func (s *PostService) Create(post *model.Post) error {
	return query.Post.Create(post)
}

func (s *PostService) Update(id uint, post *model.Post) error {
	p := query.Post
	_, err := p.Where(p.ID.Eq(id)).Updates(post)
	return err
}

func (s *PostService) Delete(id uint) error {
	p := query.Post
	_, err := p.Where(p.ID.Eq(id)).Delete()
	return err
}
