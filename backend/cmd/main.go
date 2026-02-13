package main

import (
	"fmt"
	"log"
	"tour-guide-blog-backend/internal/api/routers"
	"tour-guide-blog-backend/internal/dao"
	"tour-guide-blog-backend/internal/seed"

	"github.com/spf13/viper"
)

func main() {
	// 加载配置
	viper.SetConfigFile("configs/config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	// 初始化数据库
	dsn := viper.GetString("database.dsn")
	dao.InitDB(dsn)

	// 初始化数据
	seed.Seed()

	// 初始化路由
	r := routers.InitRouter()

	// 启动服务器
	port := viper.GetString("server.port")
	fmt.Printf("Server is running on port %s\n", port)
	r.Run(":" + port)
}
