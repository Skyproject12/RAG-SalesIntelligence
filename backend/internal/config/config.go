package config

import (
	"errors"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

const (
	defaultPort        = "8080"
	defaultFrontendURL = "http://localhost:3000"
)

type Config struct {
	DatabaseURL string
	Port        string
	FrontendURL string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		return Config{}, errors.New("DATABASE_URL wajib diisi")
	}

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = defaultPort
	}

	frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
	if frontendURL == "" {
		frontendURL = defaultFrontendURL
	}

	return Config{
		DatabaseURL: databaseURL,
		Port:        port,
		FrontendURL: frontendURL,
	}, nil
}
