import { useState, useEffect, type JSX } from "react";
import axios from "axios";
import Card from "./components/Card";
import CardContent from "./components/CardContent";
import Button from "./components/Button";
import Input from "./components/Input";
import LineChartHistorico from "./components/LineChartHistorico";
import PieChartCarteira from "./components/PieChartCarteira";

type Ativo = {
  ticker: string;
  percentual: number;
};

type StockListItem = {
  stock: string;
  name: string;
  close: number;
  change : number;
  volume : number;
  market_cap : number;
  logo : string;
  sector : string;
  type : string;
};

type StockInformacoes = {
  stock: string;
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
};

export default function CarteiraSimulador(): JSX.Element {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [inputBlocks, setInputBlocks] = useState([{ ticker: "", percentual: "" }]);
  const [historicoStock, setHistoricoStock] = useState<StockInformacoes[][]>([]);
  const [stockList, setStockList] = useState<StockListItem[]>([]);
  const [autocompleteIdx, setAutocompleteIdx] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

  // Carrega tickers do JSON ao montar
  useEffect(() => {
    // Tenta carregar do localStorage primeiro
    const cached = localStorage.getItem("stockList");
    const cachedTime = localStorage.getItem("stockList_time");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cached && cachedTime && now - Number(cachedTime) < oneDay) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setStockList(parsed);
          return;
        }
      } catch {}
    }
    // Se não houver cache válido, faz a requisição
    axios.get("http://localhost:8080/api/stocklist")
      .then(res => {
        const stocks = res.data.stocks as StockListItem[] || [];
        setStockList(stocks);
        localStorage.setItem("stockList", JSON.stringify(stocks));
        localStorage.setItem("stockList_time", now.toString());
      })
      .catch(() => setStockList([]));
  }, []);

  // Atualiza valor de um campo em um bloco específico
  const handleInputChange = (index: number, field: "ticker" | "percentual", value: string) => {
    setInputBlocks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Adiciona um novo bloco vazio abaixo do bloco selecionado
  const handleRepeatBlock = (index: number) => {
    setInputBlocks(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, { ticker: "", percentual: "" });
      return updated;
    });
  };

  const handleRemoverLinha = (index: number) => {
    setInputBlocks(inputBlocks.filter((_, i) => i !== index));
  };

  // Adiciona todos os blocos válidos como ativos
  const handleAdicionar = (): void => {
    setAtivos([]); // Limpa a lista de ativos antes de adicionar novos
    const novosAtivos = inputBlocks
      .map(b => ({ ticker: b.ticker.toUpperCase(), percentual: parseFloat(b.percentual) }))
      .filter(b => !isNaN(b.percentual) && b.percentual > 0);
    if (novosAtivos.length === 0) return;
    setAtivos((prev) => [...prev, ...novosAtivos]);
  };

  const somarDistribuicao = (): number => {
    let total = parseFloat(inputBlocks.map(inputValor => parseFloat(inputValor.percentual) || 0).reduce((acc, b) => acc + b, 0).toFixed(2));
    return total;
  };

  // Função utilitária para formatar timestamp (segundos) para dd/MM/yyyy
  function formatarData(timestamp: number): string {
    if (!timestamp) return "";
    // Se vier em segundos, multiplica por 1000 para converter para ms
    const date = new Date(timestamp * 1000);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  const CustomTooltip = ({ payload, label }: { payload?: any[]; label?: string; }) => {
    if (payload && payload.length) {
      return (
        <div className="p-2 backdrop-blur-[2px] rounded shadow text-xs border" >
          <div>
            <b>Data:</b> {formatarData(Number(label))}
          </div>
          <div>
            <b>Variação:</b> {payload[0].value?.toFixed(2)}%
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (ativos.length === 0) return;

    // Limpa o historicoStock antes de buscar novos dados
    setHistoricoStock([]);

    // Envia os ativos para o backend para simulação
    axios.post("http://localhost:8080/api/simular", ativos)
      .then((res) => {
        // Espera que o backend retorne um array de históricos por ativo
        // Exemplo: { historicoStock: StockInformacoes[][] }
        const historicoStockBackend = res.data.historicoStock as StockInformacoes[][];
        setHistoricoStock(historicoStockBackend || []);
      })
      .catch((err) => console.error("Erro ao buscar histórico: ", err));
  }, [ativos]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold">Simulador de Carteira</h1>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <div className="space-y-2">
            {inputBlocks.map((block, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="relative w-[65%]">
                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Ticker (ex: PETR4)"
                    value={block.ticker}
                    onChange={(e) => {
                      handleInputChange(idx, "ticker", e.target.value);
                      setShowSuggestions(idx);
                      setAutocompleteIdx(null);
                    }}
                    onFocus={() => setShowSuggestions(idx)}
                    onClick={() => setShowSuggestions(idx)}
                    onBlur={() => setTimeout(() => setShowSuggestions(null), 100)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(null);
                      }
                    }}
                    autoComplete="off"
                  />
                  {showSuggestions === idx && (
                    <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto text-white text-sm" style={{maxHeight: '15rem'}}>
                      {(Array.isArray(stockList) ? stockList : []).filter(stockItem => stockItem.stock.toLowerCase().includes(block.ticker.toLowerCase())).slice(0, 10).map((stockItem, sidx) => (
                        <li
                          key={stockItem.stock}
                          className={`
                            px-3 py-2 cursor-pointer 
                            hover:bg-blue-700 
                            rounded-lg flex items-center gap-2 
                            transition-colors duration-150
                            ${autocompleteIdx === sidx ? 'bg-blue-800' : ''}
                          `}
                          onMouseDown={() => {
                            handleInputChange(idx, "ticker", stockItem.stock);
                            setShowSuggestions(null);
                          }}
                        >
                          <img
                            src={stockItem.logo}
                            alt={stockItem.stock}
                            className="w-7 h-7 object-contain mr-2 bg-white rounded-full border border-gray-300 shadow-sm"
                          />
                          <span className="font-medium text-white">
                            {stockItem.stock}
                            <span className="text-gray-400 font-normal ml-2">{stockItem.name}</span>
                          </span>
                          <span className={`ml-auto text-right ${stockItem.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stockItem.change.toFixed(5)}
                          </span>
                        </li>
                      ))}
                      {(!Array.isArray(stockList) || stockList.filter(stockItem => stockItem.stock.toLowerCase().includes(block.ticker.toLowerCase())).length === 0) && (
                        <li className="px-3 py-2 text-gray-400">Nenhum resultado</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 w-[35%]">
                  <Input
                    placeholder="% do total"
                    value={block.percentual}
                    onChange={(e) => handleInputChange(idx, "percentual", e.target.value)}
                    type="number"
                    min={0}
                    max={100}
                  />
                  {inputBlocks.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoverLinha(idx)}
                      title="Remover linha"
                      className="w-9 h-9 p-0 flex items-center justify-center bg-red-700 hover:bg-red-800 text-white rounded-xl text-lg"
                    >
                      -
                    </Button>
                  )}
                  {idx === inputBlocks.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRepeatBlock(idx)}
                      title="Adicionar ativo"
                      className="w-9 h-9 p-0 flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-lg"
                    >
                      +
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleAdicionar} disabled={somarDistribuicao() !== 100}>
            Analisar carteira
          </Button>
          <p className={`text-sm ${somarDistribuicao() > 100 ? "text-red-500" : "text-gray-400"}`}>
            Distribuição atual: {somarDistribuicao()}%
          </p>
        </CardContent>
      </Card>

      {ativos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Distribuição da Carteira
            </h2>
            <PieChartCarteira ativos={ativos} />
          </CardContent>
        </Card>
      )}
    
      {historicoStock.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Histórico da carteira
              <span className="text-sm text-gray-400"> (últimos 3 meses)</span>
            </h2>
            <LineChartHistorico
              historicoStock={historicoStock}
              ativos={ativos}
              lines={[{
                dataKey: "variacaoPercentual",
                name: "Carteira",
                color: "#0088FE"
              }]}
              customTooltip={CustomTooltip}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
