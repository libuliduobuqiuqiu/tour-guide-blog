package routers

import (
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

func initHTTPLogWriter(debug bool) io.Writer {
	logPath := viper.GetString("log.http_file")
	if logPath == "" {
		return os.Stdout
	}

	dir := filepath.Dir(logPath)
	if dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("failed to create log directory %s: %v", dir, err)
			return os.Stdout
		}
	}

	file, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("failed to open log file %s: %v", logPath, err)
		return os.Stdout
	}

	if debug {
		return io.MultiWriter(os.Stdout, file)
	}

	return file
}
