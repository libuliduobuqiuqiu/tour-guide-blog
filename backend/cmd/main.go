package main

import (
	"flag"
	"fmt"
	"log"
	"tour-guide-blog-backend/api/routers"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/version"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	debug := flag.Bool("d", false, "enable debug mode")
	printVersion := flag.Bool("v", false, "print version and exit")
	flag.Parse()

	if *printVersion {
		fmt.Println(version.Version)
		return
	}

	if *debug {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// 加载配置
	viper.SetConfigFile("configs/config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	// 初始化数据库
	dsn := viper.GetString("database.dsn")
	dao.InitDB(dsn, *debug)

	// 初始化数据
	// seed.Seed()

	// 初始化路由
	r := routers.InitRouter(*debug)

	// 启动服务器
	port := viper.GetString("server.port")
	log.Printf("Starting backend version=%s", version.Version)
	fmt.Printf("Server is running on port %s\n", port)
	r.Run(":" + port)
}
