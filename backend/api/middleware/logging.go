package middleware

import (
	"io"
	"log"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
)

// ErrorStackLogger records stack traces when a request ends with errors or 5xx.
func ErrorStackLogger(w io.Writer) gin.HandlerFunc {
	logger := log.New(w, "", log.LstdFlags)

	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		status := c.Writer.Status()
		if len(c.Errors) == 0 && status < 500 {
			return
		}

		latency := time.Since(start)
		logger.Printf(
			"[ERROR] %s %s status=%d latency=%s client=%s errors=%v\n%s",
			c.Request.Method,
			c.Request.URL.Path,
			status,
			latency,
			c.ClientIP(),
			c.Errors,
			debug.Stack(),
		)
	}
}
