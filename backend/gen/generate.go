package main

import (
	"tour-guide-blog-backend/internal/model"

	"gorm.io/gen"
)

func main() {
	g := gen.NewGenerator(gen.Config{
		OutPath:      "internal/query",
		Mode:         gen.WithDefaultQuery | gen.WithQueryInterface | gen.WithoutContext,
		FieldNullable: true,
	})

	// 指定模型
	g.ApplyBasic(
		model.Tour{},
		model.Post{},
		model.Contact{},
		model.Admin{},
		model.Config{},
		model.Carousel{},
		model.Review{},
	)

	g.Execute()
}
