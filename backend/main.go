package main

import (
	"log"

	"sales-intelligence-backend/internal/config"
	"sales-intelligence-backend/internal/database"
	"sales-intelligence-backend/internal/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.OpenPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	engine := router.New(db, cfg)
	log.Printf("Backend berjalan di http://localhost:%s", cfg.Port)
	if err := engine.Run(":" + cfg.Port); err != nil {
		log.Fatal("Gagal menjalankan server:", err)
	}
}
