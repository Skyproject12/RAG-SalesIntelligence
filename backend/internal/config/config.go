package config

import (
	"errors"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

const defaultPort = "8080"

type Config struct {
	DatabaseURL string
	Port        string
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

	return Config{
		DatabaseURL: databaseURL,
		Port:        port,
	}, nil
}
