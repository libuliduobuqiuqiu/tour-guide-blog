package routers

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/spf13/viper"
)

func initHTTPLogWriter(debug bool) io.Writer {
	logPath := viper.GetString("log.http_file")
	if logPath == "" {
		return os.Stdout
	}

	retentionDays := viper.GetInt("log.http_retention_days")
	if retentionDays <= 0 {
		retentionDays = 30
	}

	writer, err := newDailyRotatingWriter(logPath, retentionDays)
	if err != nil {
		log.Printf("failed to initialize log writer %s: %v", logPath, err)
		return os.Stdout
	}

	if debug {
		return io.MultiWriter(os.Stdout, writer)
	}

	return writer
}

type dailyRotatingWriter struct {
	retentionDays int
	dir           string
	baseName      string
	ext           string
	dateLayout    string

	mu          sync.Mutex
	currentDate string
	file        *os.File
}

func newDailyRotatingWriter(basePath string, retentionDays int) (*dailyRotatingWriter, error) {
	dir := filepath.Dir(basePath)
	if dir == "" || dir == "." {
		dir = "."
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("create log directory: %w", err)
	}

	filename := filepath.Base(basePath)
	ext := filepath.Ext(filename)
	baseName := strings.TrimSuffix(filename, ext)
	if baseName == "" {
		baseName = "http"
	}

	w := &dailyRotatingWriter{
		retentionDays: retentionDays,
		dir:           dir,
		baseName:      baseName,
		ext:           ext,
		dateLayout:    "2006-01-02",
	}

	if err := w.rotateIfNeeded(time.Now()); err != nil {
		return nil, err
	}
	return w, nil
}

func (w *dailyRotatingWriter) Write(p []byte) (int, error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	now := time.Now()
	if err := w.rotateIfNeeded(now); err != nil {
		return 0, err
	}
	return w.file.Write(p)
}

func (w *dailyRotatingWriter) rotateIfNeeded(now time.Time) error {
	today := now.Format(w.dateLayout)
	if w.file != nil && today == w.currentDate {
		return nil
	}

	if w.file != nil {
		_ = w.file.Close()
		w.file = nil
	}

	path := w.logPathForDate(today)
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("open log file: %w", err)
	}
	w.file = file
	w.currentDate = today

	if err := w.cleanupExpired(now); err != nil {
		log.Printf("failed to cleanup old log files: %v", err)
	}
	return nil
}

func (w *dailyRotatingWriter) logPathForDate(date string) string {
	return filepath.Join(w.dir, fmt.Sprintf("%s-%s%s", w.baseName, date, w.ext))
}

func (w *dailyRotatingWriter) cleanupExpired(now time.Time) error {
	files, err := os.ReadDir(w.dir)
	if err != nil {
		return err
	}

	prefix := w.baseName + "-"
	todayDate, _ := time.Parse(w.dateLayout, now.Format(w.dateLayout))
	cutoff := todayDate.AddDate(0, 0, -(w.retentionDays - 1))

	for _, entry := range files {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		if !strings.HasPrefix(name, prefix) || !strings.HasSuffix(name, w.ext) {
			continue
		}

		datePart := strings.TrimSuffix(strings.TrimPrefix(name, prefix), w.ext)
		parsedDate, err := time.Parse(w.dateLayout, datePart)
		if err != nil {
			continue
		}

		if parsedDate.Before(cutoff) {
			path := filepath.Join(w.dir, name)
			if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
				log.Printf("failed to remove expired log file %s: %v", path, err)
			}
		}
	}
	return nil
}
