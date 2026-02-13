package seed

import (
	"log"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"
)

func Seed() {
	seedReviews()
	seedCarousels()
	seedTours()
	seedPosts()
	seedSiteSettings()
}

func seedReviews() {
	var count int64
	dao.DB.Model(&model.Review{}).Count(&count)
	if count > 0 {
		return
	}

	reviews := []model.Review{
		{Username: "Alice Chen", Content: "Wonderful experience in Guangzhou. The Pearl River night cruise was stunning.", Rating: 5, IsActive: true},
		{Username: "John Li", Content: "Cantonese food tour was the best. Learned so much and ate even more.", Rating: 5, IsActive: true},
		{Username: "Maria Garcia", Content: "Very professional guide. The old Xiguan houses were fascinating.", Rating: 5, IsActive: true},
		{Username: "David Kim", Content: "Flexible itinerary and great local suggestions around Beijing Road.", Rating: 4, IsActive: true},
		{Username: "Sophie Martin", Content: "Chimelong safari trip was unforgettable. Thank you!", Rating: 5, IsActive: true},
		{Username: "Michael Brown", Content: "Clear communication and very friendly. Highly recommended.", Rating: 5, IsActive: true},
		{Username: "Emily Wilson", Content: "Loved the historical walk through Liwan and Shamian Island.", Rating: 5, IsActive: true},
		{Username: "James Lee", Content: "Great value and comfortable transport.", Rating: 4, IsActive: true},
		{Username: "Sarah Johnson", Content: "Will book again when we return to Guangzhou.", Rating: 5, IsActive: true},
		{Username: "Robert Taylor", Content: "A true local expert. Found hidden gems we would miss.", Rating: 5, IsActive: true},
		{Username: "Linda Davis", Content: "Patient and knowledgeable. Perfect for families.", Rating: 5, IsActive: true},
		{Username: "William Anderson", Content: "The city skyline at night was spectacular.", Rating: 5, IsActive: true},
	}

	if err := dao.DB.Create(&reviews).Error; err != nil {
		log.Printf("Failed to seed reviews: %v", err)
	} else {
		log.Println("Seeded 12 reviews")
	}
}

func seedCarousels() {
	var count int64
	dao.DB.Model(&model.Carousel{}).Count(&count)
	if count > 0 {
		return
	}

	items := []model.Carousel{
		{Title: "Discover Guangzhou", ImageUrl: "/uploads/guangzhou-hero-1.jpg", LinkUrl: "/tours", SortOrder: 1, IsActive: true},
		{Title: "Pearl River Night Cruise", ImageUrl: "/uploads/guangzhou-hero-2.jpg", LinkUrl: "/tours", SortOrder: 2, IsActive: true},
		{Title: "Taste Cantonese Cuisine", ImageUrl: "/uploads/guangzhou-hero-3.jpg", LinkUrl: "/blog", SortOrder: 3, IsActive: true},
	}
	if err := dao.DB.Create(&items).Error; err != nil {
		log.Printf("Failed to seed carousels: %v", err)
	} else {
		log.Println("Seeded 3 carousels")
	}
}

func seedTours() {
	var count int64
	dao.DB.Model(&model.Tour{}).Count(&count)
	if count > 0 {
		return
	}
	tours := []model.Tour{
		{Title: "Pearl River Night Cruise", Description: "Enjoy Guangzhou skyline with a relaxing cruise.", Content: "Details about the night cruise.", CoverImage: "/uploads/pearl-river.jpg", Price: 299.00, Duration: "3 hours", Location: "Guangzhou"},
		{Title: "Cantonese Food Tour", Description: "Taste authentic dim sum and local delicacies.", Content: "Food stops and recommendations.", CoverImage: "/uploads/cantonese-food.jpg", Price: 399.00, Duration: "4 hours", Location: "Guangzhou"},
		{Title: "Shamian Island Heritage Walk", Description: "Explore colonial architecture and riverside history.", Content: "Walking route and highlights.", CoverImage: "/uploads/shamian.jpg", Price: 199.00, Duration: "2 hours", Location: "Guangzhou"},
	}
	if err := dao.DB.Create(&tours).Error; err != nil {
		log.Printf("Failed to seed tours: %v", err)
	} else {
		log.Println("Seeded 3 tours")
	}
}

func seedPosts() {
	var count int64
	dao.DB.Model(&model.Post{}).Count(&count)
	if count > 0 {
		return
	}
	posts := []model.Post{
		{Title: "Top 10 Cantonese Dishes to Try", Summary: "A quick guide to must-try foods in Guangzhou.", Content: "Long content about dishes.", CoverImage: "/uploads/dim-sum.jpg", Category: "Food", Tags: "food,cantonese,guangzhou"},
		{Title: "Pearl River Cruise Tips", Summary: "Best time and seats for night cruise.", Content: "Cruise tips and booking advice.", CoverImage: "/uploads/cruise-tips.jpg", Category: "Travel", Tags: "cruise,river,guangzhou"},
		{Title: "A Walk Through Shamian Island", Summary: "History and highlights of Shamian.", Content: "Historical background and spots.", CoverImage: "/uploads/shamian-blog.jpg", Category: "History", Tags: "history,shamian,guangzhou"},
	}
	if err := dao.DB.Create(&posts).Error; err != nil {
		log.Printf("Failed to seed posts: %v", err)
	} else {
		log.Println("Seeded 3 posts")
	}
}

func seedSiteSettings() {
	var count int64
	dao.DB.Model(&model.Config{}).Where("`key` = ?", "site_settings").Count(&count)
	if count > 0 {
		return
	}
	value := `{"home_hero_title":"Professional Tour Guide in Guangzhou","home_hero_subtitle":"Explore the Pearl River and vibrant Cantonese culture."}`
	item := model.Config{Key: "site_settings", Value: value}
	if err := dao.DB.Create(&item).Error; err != nil {
		log.Printf("Failed to seed site settings: %v", err)
	} else {
		log.Println("Seeded site settings")
	}
}
