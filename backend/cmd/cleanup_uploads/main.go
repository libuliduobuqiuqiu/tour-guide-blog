package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"tour-guide-blog-backend/internal/model"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var uploadRefPattern = regexp.MustCompile(`/uploads/[^"'()\s<>]+`)

func main() {
	var (
		configPath = flag.String("config", "", "path to backend config file")
		apply      = flag.Bool("apply", false, "delete unused files instead of dry-run")
	)
	flag.Parse()

	resolvedConfig, err := resolveConfigPath(strings.TrimSpace(*configPath))
	if err != nil {
		log.Fatal(err)
	}

	viper.SetConfigFile(resolvedConfig)
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("read config failed: %v", err)
	}

	dsn := strings.TrimSpace(viper.GetString("database.dsn"))
	if dsn == "" {
		log.Fatal("database.dsn is required")
	}

	uploadPath := strings.TrimSpace(viper.GetString("upload.path"))
	if uploadPath == "" {
		log.Fatal("upload.path is required")
	}
	if !filepath.IsAbs(uploadPath) {
		workingDir, err := os.Getwd()
		if err != nil {
			log.Fatalf("get working directory failed: %v", err)
		}
		uploadPath = filepath.Join(workingDir, uploadPath)
	}
	uploadPath = filepath.Clean(uploadPath)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("connect database failed: %v", err)
	}

	usedRefs, err := collectUsedUploadRefs(db)
	if err != nil {
		log.Fatalf("collect used uploads failed: %v", err)
	}

	usedFiles := make(map[string]struct{}, len(usedRefs))
	for ref := range usedRefs {
		trimmed := strings.TrimPrefix(ref, "/uploads/")
		if trimmed != "" {
			usedFiles[filepath.Clean(trimmed)] = struct{}{}
		}
	}

	actualFiles, err := listUploadFiles(uploadPath)
	if err != nil {
		log.Fatalf("scan upload directory failed: %v", err)
	}

	unusedFiles := make([]string, 0)
	for _, relPath := range actualFiles {
		if _, ok := usedFiles[relPath]; !ok {
			unusedFiles = append(unusedFiles, relPath)
		}
	}

	sort.Strings(actualFiles)
	sort.Strings(unusedFiles)

	fmt.Printf("Config: %s\n", resolvedConfig)
	fmt.Printf("Uploads dir: %s\n", uploadPath)
	fmt.Printf("Referenced upload paths: %d\n", len(usedFiles))
	fmt.Printf("Files in uploads dir: %d\n", len(actualFiles))
	fmt.Printf("Unused files: %d\n", len(unusedFiles))

	if len(unusedFiles) > 0 {
		fmt.Println("")
		fmt.Println("Unused upload files:")
		for _, relPath := range unusedFiles {
			fmt.Printf("  %s\n", relPath)
		}
	}

	if !*apply {
		fmt.Println("")
		fmt.Println("Dry run only. Re-run with --apply to delete the unused files.")
		return
	}

	deletedCount := 0
	for _, relPath := range unusedFiles {
		absPath := filepath.Join(uploadPath, relPath)
		if err := os.Remove(absPath); err != nil {
			log.Fatalf("delete %s failed: %v", absPath, err)
		}
		deletedCount++
	}

	fmt.Println("")
	fmt.Printf("Deleted %d unused upload files.\n", deletedCount)
}

func resolveConfigPath(explicit string) (string, error) {
	candidates := make([]string, 0, 3)
	if explicit != "" {
		candidates = append(candidates, explicit)
	}
	candidates = append(candidates, "configs/config.yaml", "configs/config_temp.yaml")

	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}
		if _, err := os.Stat(candidate); err == nil {
			return candidate, nil
		}
	}

	return "", errors.New("no config file found; pass --config or create backend/configs/config.yaml")
}

func collectUsedUploadRefs(db *gorm.DB) (map[string]struct{}, error) {
	used := map[string]struct{}{}

	var tours []model.Tour
	if err := db.Find(&tours).Error; err != nil {
		return nil, err
	}
	for _, tour := range tours {
		addUploadRef(used, tour.CoverImage)
		extractUploadRefs(used, tour.Content)
		for _, point := range tour.RoutePoints {
			addUploadRef(used, point.Image)
			extractUploadRefs(used, point.Content)
		}
	}

	var posts []model.Post
	if err := db.Find(&posts).Error; err != nil {
		return nil, err
	}
	for _, post := range posts {
		addUploadRef(used, post.CoverImage)
		extractUploadRefs(used, post.Content)
	}

	var reviews []model.Review
	if err := db.Find(&reviews).Error; err != nil {
		return nil, err
	}
	for _, review := range reviews {
		addUploadRef(used, review.Avatar)
		for _, photo := range review.Photos {
			addUploadRef(used, photo)
		}
	}

	var carousels []model.Carousel
	if err := db.Find(&carousels).Error; err != nil {
		return nil, err
	}
	for _, item := range carousels {
		addUploadRef(used, item.ImageUrl)
	}

	var configs []model.Config
	if err := db.Find(&configs).Error; err != nil {
		return nil, err
	}
	for _, cfg := range configs {
		extractUploadRefs(used, cfg.Value)
	}

	return used, nil
}

func extractUploadRefs(target map[string]struct{}, raw string) {
	for _, match := range uploadRefPattern.FindAllString(raw, -1) {
		addUploadRef(target, match)
	}
}

func addUploadRef(target map[string]struct{}, raw string) {
	value := strings.TrimSpace(raw)
	if !strings.HasPrefix(value, "/uploads/") {
		return
	}
	normalized := filepath.ToSlash(filepath.Clean(strings.TrimPrefix(value, "/")))
	if !strings.HasPrefix(normalized, "uploads/") {
		return
	}
	target["/"+normalized] = struct{}{}
}

func listUploadFiles(root string) ([]string, error) {
	files := make([]string, 0)
	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}

		relPath, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		files = append(files, filepath.ToSlash(relPath))
		return nil
	})
	return files, err
}
