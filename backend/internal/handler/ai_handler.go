package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"sales-intelligence-backend/internal/ai"
	"sales-intelligence-backend/internal/model"
	"sales-intelligence-backend/internal/service"
)

type AIHandler struct {
	service *service.AIService
}

func NewAIHandler(service *service.AIService) *AIHandler {
	return &AIHandler{service: service}
}

func (h *AIHandler) Chat(c *gin.Context) {
	var request model.ChatRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Body request harus berupa JSON yang valid",
		})
		return
	}

	result, err := h.service.Chat(c.Request.Context(), request)
	if errors.Is(err, service.ErrInvalidChat) {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if errors.Is(err, ai.ErrNotConfigured) {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Google Gemini belum dikonfigurasi pada backend",
		})
		return
	}
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "AI Assistant sedang tidak tersedia",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
