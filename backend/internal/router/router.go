package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"sales-intelligence-backend/internal/handler"
	"sales-intelligence-backend/internal/repository"
)

func New(db *sql.DB) *gin.Engine {
	engine := gin.Default()

	healthHandler := handler.NewHealthHandler(db)
	salesRepository := repository.NewSalesRepository(db)
	salesHandler := handler.NewSalesHandler(salesRepository)

	engine.GET("/health", healthHandler.Check)

	api := engine.Group("/api/v1")
	api.GET("/sales", salesHandler.List)
	api.GET("/sales/:id", salesHandler.Detail)

	return engine
}
