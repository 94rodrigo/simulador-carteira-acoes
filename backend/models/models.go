package models

type Ativo struct {
	Ticker     string  `json:"ticker"`
	Percentual float64 `json:"percentual"`
}

type Historico struct {
	Simbolo            string  `json:"simbolo"`
	Date               int64   `json:"date"`
	VariacaoPercentual float64 `json:"variacaoPercentual"`
}

type StockListItem struct {
	Stock     string  `json:"stock"`
	Name      string  `json:"name"`
	Close     float64 `json:"close"`
	Change    float64 `json:"change"`
	Volume    float64 `json:"volume"`
	MarketCap float64 `json:"market_cap"`
	Logo      string  `json:"logo"`
	Sector    string  `json:"sector"`
}

type StockInformacoes struct {
	Stock         string  `json:"stock"`
	Date          int64   `json:"date"`
	Open          float64 `json:"open"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Close         float64 `json:"close"`
	Volume        float64 `json:"volume"`
	AdjustedClose float64 `json:"adjustedClose"`
}
