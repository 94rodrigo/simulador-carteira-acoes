package main

import (
	"log"
	"net/http"
	"simulador-carteira-acoes/backend/handlers"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	http.HandleFunc("/api/stocklist", handlers.StockListHandler)
	http.HandleFunc("/api/simular", handlers.SimularCarteiraHandler)

	log.Println("Backend do simulador iniciado na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
