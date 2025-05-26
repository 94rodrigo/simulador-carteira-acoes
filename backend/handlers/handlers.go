package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"simulador-carteira-acoes/backend/models"
)

var token = os.Getenv("BRAPI_TOKEN")

// GET /stocklist
func StockListHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Requisição recebida em /stocklist")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	resp, err := http.Get("https://brapi.dev/api/quote/list?sortBy=name&sortOrder=asc&token=" + token)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Erro ao buscar dados da API externa"))
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")

	// Crie uma struct temporária para decodificar apenas o campo "stocks"
	var result struct {
		Stocks interface{} `json:"stocks"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Erro ao ler stocklist.json"))
		return
	}
	// Retorne apenas o array de ações
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stocks": result.Stocks,
	})
}

// POST /simular
func SimularCarteiraHandler(w http.ResponseWriter, r *http.Request) {
	var ativos []models.Ativo
	if err := json.NewDecoder(r.Body).Decode(&ativos); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("JSON inválido"))
		return
	}
	// Aqui você implementaria a lógica de simulação (mock de resposta)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"historico": []models.Historico{},
	})
}
