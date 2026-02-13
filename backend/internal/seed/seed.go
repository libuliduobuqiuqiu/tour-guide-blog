package seed

import (
	"log"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/model"
)

func Seed() {
	seedReviews()
	seedCarousels()
}

func seedReviews() {
	var count int64
	dao.DB.Model(&model.Review{}).Count(&count)
	if count > 0 {
		return
	}

	reviews := []model.Review{
		{Username: "Alice Smith", Content: "Janet was an amazing guide! She knows Chongqing like the back of her hand.", Rating: 5, IsActive: true},
		{Username: "John Doe", Content: "The food tour was the highlight of our trip. Highly recommend!", Rating: 5, IsActive: true},
		{Username: "Maria Garcia", Content: "Very professional and friendly. We learned so much about the history.", Rating: 5, IsActive: true},
		{Username: "David Kim", Content: "Flexible itinerary and great suggestions for local spots.", Rating: 4, IsActive: true},
		{Username: "Sophie Martin", Content: "Chengdu panda base tour was unforgettable. Thanks Janet!", Rating: 5, IsActive: true},
		{Username: "Michael Brown", Content: "Janet speaks excellent English and is very easy to communicate with.", Rating: 5, IsActive: true},
		{Username: "Emily Wilson", Content: "We had a wonderful time exploring the hidden alleys of Chongqing.", Rating: 5, IsActive: true},
		{Username: "James Lee", Content: "Great value for money. The private car was very comfortable.", Rating: 4, IsActive: true},
		{Username: "Sarah Johnson", Content: "I would definitely book with Janet again next time I visit China.", Rating: 5, IsActive: true},
		{Username: "Robert Taylor", Content: "A true local expert. She took us to places we would never find on our own.", Rating: 5, IsActive: true},
		{Username: "Linda Davis", Content: "Janet is patient and knowledgeable. Perfect for families.", Rating: 5, IsActive: true},
		{Username: "William Anderson", Content: "The night view tour was spectacular!", Rating: 5, IsActive: true},
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

	// Default carousels if none exist.
	// Since we don't have real images, we can use placeholders or just leave it empty if user didn't ask.
	// User said "manage homepage carousel", didn't explicitly ask for auto-generated ones.
	// But empty carousel might look bad.
	// I'll skip auto-generating carousels for now as I don't have good image URLs.
}
