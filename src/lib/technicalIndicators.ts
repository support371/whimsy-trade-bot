// Technical indicator calculations

export interface PricePoint {
  time: string;
  price: number;
}

export interface IndicatorData {
  time: string;
  price: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  upperBand?: number;
  lowerBand?: number;
  middleBand?: number;
}

// Calculate RSI (Relative Strength Index)
export function calculateRSI(prices: number[], period: number = 14): (number | undefined)[] {
  const rsi: (number | undefined)[] = [];
  
  if (prices.length < period + 1) {
    return prices.map(() => undefined);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First RSI value uses simple average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Fill undefined for initial period
  for (let i = 0; i < period; i++) {
    rsi.push(undefined);
  }

  // Calculate RSI for each point after the period
  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period && i < prices.length; i++) {
    sum += prices[i];
  }
  ema.push(sum / Math.min(period, prices.length));

  // Calculate EMA for rest
  for (let i = 1; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(currentEMA);
  }

  return ema;
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | undefined)[]; signal: (number | undefined)[]; histogram: (number | undefined)[] } {
  if (prices.length < slowPeriod) {
    return {
      macd: prices.map(() => undefined),
      signal: prices.map(() => undefined),
      histogram: prices.map(() => undefined),
    };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);

  // Normalize for display
  const maxMacd = Math.max(...macdLine.map(Math.abs));
  const scale = maxMacd > 0 ? 50 / maxMacd : 1;

  return {
    macd: macdLine.map((v, i) => i < slowPeriod - 1 ? undefined : 50 + v * scale),
    signal: signalLine.map((v, i) => i < slowPeriod - 1 ? undefined : 50 + v * scale),
    histogram: histogram.map((v, i) => i < slowPeriod - 1 ? undefined : v * scale),
  };
}

// Calculate Bollinger Bands
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: (number | undefined)[]; middle: (number | undefined)[]; lower: (number | undefined)[] } {
  const upper: (number | undefined)[] = [];
  const middle: (number | undefined)[] = [];
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(undefined);
      middle.push(undefined);
      lower.push(undefined);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    middle.push(sma);
    upper.push(sma + stdDev * standardDeviation);
    lower.push(sma - stdDev * standardDeviation);
  }

  return { upper, middle, lower };
}

// Apply all indicators to price data
export function applyIndicators(data: PricePoint[]): IndicatorData[] {
  const prices = data.map(d => d.price);
  
  const rsiValues = calculateRSI(prices, 7); // Shorter period for limited data
  const macdData = calculateMACD(prices, 6, 13, 5); // Shorter periods
  const bollingerData = calculateBollingerBands(prices, 10, 2); // Shorter period

  return data.map((point, i) => ({
    ...point,
    rsi: rsiValues[i],
    macd: macdData.macd[i],
    signal: macdData.signal[i],
    histogram: macdData.histogram[i],
    upperBand: bollingerData.upper[i],
    lowerBand: bollingerData.lower[i],
    middleBand: bollingerData.middle[i],
  }));
}
