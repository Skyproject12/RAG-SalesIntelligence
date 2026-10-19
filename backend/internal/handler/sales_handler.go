package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"sales-intelligence-backend/internal/repository"
)

const (
	defaultPage  = 1
	defaultLimit = 10
	maximumLimit = 100
)

type SalesHandler struct {
	repository *repository.SalesRepository
}

func NewSalesHandler(repository *repository.SalesRepository) *SalesHandler {
	return &SalesHandler{repository: repository}
}

func (h *SalesHandler) List(c *gin.Context) {
	page := positiveInt(c.DefaultQuery("page", "1"), defaultPage)
	limit := positiveInt(c.DefaultQuery("limit", "10"), defaultLimit)
	if limit > maximumLimit {
		limit = maximumLimit
	}

	filter := repository.SalesFilter{
		Search:     strings.TrimSpace(c.Query("search")),
		RegionCode: strings.TrimSpace(c.Query("region")),
		Status:     strings.TrimSpace(c.Query("status")),
		Target:     strings.TrimSpace(c.Query("target")),
		Limit:      limit,
		Offset:     (page - 1) * limit,
	}

	sales, total, err := h.repository.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengambil data sales",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": sales,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + limit - 1) / limit,
		},
	})
}

func (h *SalesHandler) Detail(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID sales tidak valid",
		})
		return
	}

	item, err := h.repository.FindByID(c.Request.Context(), id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Sales tidak ditemukan",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengambil detail sales",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item})
}

func positiveInt(value string, fallback int) int {
	result, err := strconv.Atoi(value)
	if err != nil || result < 1 {
		return fallback
	}
	return result
}
