package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"simulador-carteira-acoes/backend/models"
	"simulador-carteira-acoes/backend/service"
)

type CalcularHistoricoRequest struct {
	Ativos         []service.Ativo             `json:"ativos"`
	HistoricoStock [][]models.StockInformacoes `json:"historicoStock"`
	DataInicial    int64                       `json:"dataInicial"`
	DataFinal      int64                       `json:"dataFinal"`
}

func getToken() string {
	return os.Getenv("BRAPI_TOKEN")
}

// GET /stocklist
func StockListHandler(w http.ResponseWriter, r *http.Request) {
	numeroMaximosStockQuery := int64(99999999999999)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	url := "https://brapi.dev/api/quote/list?sortBy=name&sortOrder=asc&limit=" + fmt.Sprintf("%d", numeroMaximosStockQuery) + "&token=" + getToken()
	resp, err := http.Get(url)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Erro ao buscar dados da API externa"))
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")

	// Crie uma struct temporária para decodificar apenas o campo "stocks"
	var result struct {
		Stocks any `json:"stocks"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Erro ao ler stocklist.json"))
		return
	}
	// Retorne apenas o array de ações
	json.NewEncoder(w).Encode(map[string]any{
		"stocks": result.Stocks,
	})
}

// POST /simular
func SimularCarteiraHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var ativos []models.Ativo
	if err := json.NewDecoder(r.Body).Decode(&ativos); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("JSON inválido"))
		return
	}
	// Para cada ativo, busca o histórico na brapi.dev
	var historicoStock [][]models.StockInformacoes
	for _, ativo := range ativos {
		fmt.Printf("Buscando histórico para o ativo: %s\n", ativo.Ticker)
		url := "https://brapi.dev/api/quote/" + ativo.Ticker + "?range=3mo&interval=1d&token=" + getToken()
		fmt.Println("URL da requisição:", url)
		resp, err := http.Get(url)
		if err != nil {
			historicoStock = append(historicoStock, []models.StockInformacoes{})
			continue
		}
		defer resp.Body.Close()
		var result struct {
			Results []struct {
				Symbol              string                    `json:"symbol"`
				HistoricalDataPrice []models.StockInformacoes `json:"historicalDataPrice"`
			} `json:"results"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil || len(result.Results) == 0 {
			historicoStock = append(historicoStock, []models.StockInformacoes{})
			continue
		}
		// Corrige o campo stock para cada item
		for i := range result.Results[0].HistoricalDataPrice {
			result.Results[0].HistoricalDataPrice[i].Stock = result.Results[0].Symbol
		}
		historicoStock = append(historicoStock, result.Results[0].HistoricalDataPrice)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"historicoStock": historicoStock,
	})
}

func CalcularHistoricoHandler(w http.ResponseWriter, r *http.Request) {
	var req CalcularHistoricoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	result := service.CalcularHistoricoCarteira(req.Ativos, req.HistoricoStock, req.DataInicial, req.DataFinal)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
