package service

import (
	"errors"
	"fmt"
	"simulador-carteira-acoes/backend/models"
	"strings"
)

type HistoricoCarteira struct {
	Date               int     `json:"date"`
	VariacaoPercentual float64 `json:"variacaoPercentual"`
}

type Ativo struct {
	Ticker     string  `json:"ticker"`
	Percentual float64 `json:"percentual"`
}

// CalcularHistoricoCarteira consolida o histórico da carteira a partir dos históricos individuais dos ativos e seus percentuais
func CalcularHistoricoCarteira(ativos []Ativo, historicoStock [][]models.StockInformacoes, dataInicial int64, dataFinal int64) []HistoricoCarteira {
	// Mapeia cada ativo ao seu histórico e percentual
	ativosComHistorico := make([][]struct {
		Date     int
		Variacao float64
	}, 0)

	for _, ativo := range ativos {
		historico1 := findHistoricoByTicker(historicoStock, ativo.Ticker)
		if len(historico1) == 0 {
			continue
		}
		inicial := historico1[0].AdjustedClose
		ativoHistorico := make([]struct {
			Date     int
			Variacao float64
		}, 0, len(historico1))

		if dataInicial == 0 {
			dataInicial = int64(historico1[0].Date)
		}

		if dataFinal == 0 {
			dataFinal = int64(historico1[len(historico1)-1].Date)
		}

		for _, item := range historico1 {
			if item.Date < dataInicial || item.Date > dataFinal {
				continue
			}

			variacao := ((item.AdjustedClose / inicial) - 1) * 100 * (ativo.Percentual / 100)
			ativoHistorico = append(ativoHistorico, struct {
				Date     int
				Variacao float64
			}{
				Date:     int(item.Date),
				Variacao: variacao,
			})
		}
		ativosComHistorico = append(ativosComHistorico, ativoHistorico)
	}

	// Agrupa por data e soma as variações ponderadas
	variacoesPorData := make(map[int]float64)
	for _, historico := range ativosComHistorico {
		for _, item := range historico {
			variacoesPorData[item.Date] += item.Variacao
		}
	}

	// Transforma em array ordenado por data
	result := make([]HistoricoCarteira, 0, len(variacoesPorData))
	for date, variacao := range variacoesPorData {
		result = append(result, HistoricoCarteira{
			Date:               date,
			VariacaoPercentual: variacao,
		})
	}
	// Ordena por data
	// (pode ser implementado se necessário)
	return result
}

func findHistoricoByTicker(historicos [][]models.StockInformacoes, ticker string) []models.StockInformacoes {
	for _, h := range historicos {
		if len(h) > 0 && h[0].Stock == ticker {
			return h
		}
	}
	return nil
}

// ValidarAtivos valida as regras de negócio dos ativos da carteira
func ValidarAtivos(ativos []models.Ativo) error {
	if len(ativos) == 0 {
		return errors.New("a lista de ativos não pode ser vazia")
	}
	totalPercentual := 0.0
	tickers := make(map[string]bool)
	for i, ativo := range ativos {
		if ativo.Ticker == "" {
			return errors.New("ticker não pode ser vazio")
		}
		// Normaliza para maiúsculo
		tickerUpper := strings.ToUpper(ativo.Ticker)
		ativos[i].Ticker = tickerUpper
		if ativo.Percentual <= 0 || ativo.Percentual > 100 {
			return errors.New("percentual deve ser maior que 0 e menor ou igual a 100")
		}
		if tickers[tickerUpper] {
			return errors.New("não pode haver ativos duplicados: " + tickerUpper)
		}
		tickers[tickerUpper] = true
		totalPercentual += ativo.Percentual
	}
	if int(totalPercentual+0.5) != 100 {
		return errors.New("a soma dos percentuais deve ser 100% (atual: " + fmt.Sprintf("%.2f", totalPercentual) + ")")
	}
	return nil
}
