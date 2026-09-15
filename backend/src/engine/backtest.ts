import { MarketDay } from "../data/niftyData";

export interface BacktestConfig {
  dropThreshold: number;
  holdingDays: number;
  transactionCost: number;
}

export interface Trade {
  signalDate: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  grossReturn: number;
  netReturn: number;
  winning: boolean;
}

export interface BacktestResult {
  signals: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageReturn: number;
  medianReturn: number;
  bestTrade: number;
  worstTrade: number;
  averageReturnAfterCosts: number;
  trades: Trade[];
}

export function runBacktest(
  data: MarketDay[],
  config: BacktestConfig
): BacktestResult {
  const trades: Trade[] = [];

  for (let i = 1; i < data.length; i++) {
    const previousDay = data[i - 1];
    const signalDay = data[i];

    const dailyChange =
      (signalDay.close - previousDay.close) / previousDay.close;

    if (dailyChange <= -config.dropThreshold) {
      const entryIndex = i + 1;
      const exitIndex = entryIndex + config.holdingDays - 1;

      if (exitIndex >= data.length) {
        continue;
      }

      const entryDay = data[entryIndex];
      const exitDay = data[exitIndex];

      const grossReturn =
        (exitDay.close - entryDay.open) / entryDay.open;

      const netReturn = grossReturn - config.transactionCost;

      trades.push({
        signalDate: signalDay.date,
        entryDate: entryDay.date,
        exitDate: exitDay.date,
        entryPrice: entryDay.open,
        exitPrice: exitDay.close,
        grossReturn,
        netReturn,
        winning: netReturn > 0
      });
    }
  }

  const returns = trades.map((trade) => trade.grossReturn);
  const netReturns = trades.map((trade) => trade.netReturn);

  const winningTrades = trades.filter(
    (trade) => trade.winning
  ).length;

  const sortedReturns = [...returns].sort((a, b) => a - b);

  const medianReturn =
    sortedReturns.length === 0
      ? 0
      : sortedReturns.length % 2 === 0
        ? (sortedReturns[sortedReturns.length / 2 - 1] +
            sortedReturns[sortedReturns.length / 2]) /
          2
        : sortedReturns[Math.floor(sortedReturns.length / 2)];

  const average = (values: number[]) =>
    values.length
      ? values.reduce((sum, value) => sum + value, 0) /
        values.length
      : 0;

  return {
    signals: trades.length,
    winningTrades,
    losingTrades: trades.length - winningTrades,
    winRate: trades.length
      ? winningTrades / trades.length
      : 0,
    averageReturn: average(returns),
    medianReturn,
    bestTrade: returns.length ? Math.max(...returns) : 0,
    worstTrade: returns.length ? Math.min(...returns) : 0,
    averageReturnAfterCosts: average(netReturns),
    trades
  };
}
