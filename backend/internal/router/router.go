package router

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"sales-intelligence-backend/internal/handler"
	"sales-intelligence-backend/internal/repository"
)

func New(db *sql.DB, frontendURL string) *gin.Engine {
	engine := gin.Default()
	engine.Use(cors(frontendURL))

	healthHandler := handler.NewHealthHandler(db)
	salesRepository := repository.NewSalesRepository(db)
	salesHandler := handler.NewSalesHandler(salesRepository)

	engine.GET("/health", healthHandler.Check)

	api := engine.Group("/api/v1")
	api.GET("/sales", salesHandler.List)
	api.GET("/sales/:id", salesHandler.Detail)

	return engine
}

func cors(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Vary", "Origin")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
