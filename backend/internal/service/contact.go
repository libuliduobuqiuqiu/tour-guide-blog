package service

import (
	"tour-guide-blog-backend/internal/model"
	"tour-guide-blog-backend/internal/query"
)

type ContactService struct{}

var Contact = &ContactService{}

func (s *ContactService) List() ([]*model.Contact, error) {
	con := query.Contact
	return con.Order(con.CreatedAt.Desc()).Find()
}

func (s *ContactService) Create(contact *model.Contact) error {
	return query.Contact.Create(contact)
}
