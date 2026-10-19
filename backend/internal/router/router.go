package router

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"sales-intelligence-backend/internal/config"
	"sales-intelligence-backend/internal/gemini"
	"sales-intelligence-backend/internal/handler"
	"sales-intelligence-backend/internal/repository"
	"sales-intelligence-backend/internal/service"
)

func New(db *sql.DB, cfg config.Config) *gin.Engine {
	engine := gin.Default()
	engine.Use(cors(cfg.FrontendURL))

	healthHandler := handler.NewHealthHandler(db)
	salesRepository := repository.NewSalesRepository(db)
	salesHandler := handler.NewSalesHandler(salesRepository)
	geminiClient := gemini.NewClient(cfg.GeminiAPIKey, cfg.GeminiModel)
	aiService := service.NewAIService(salesRepository, geminiClient)
	aiHandler := handler.NewAIHandler(aiService)

	engine.GET("/health", healthHandler.Check)

	api := engine.Group("/api/v1")
	api.GET("/sales", salesHandler.List)
	api.GET("/sales/:id", salesHandler.Detail)
	api.POST("/ai/chat", aiHandler.Chat)

	return engine
}

func cors(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Vary", "Origin")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
