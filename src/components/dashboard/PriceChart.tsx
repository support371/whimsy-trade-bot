import { useMemo, useState } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CryptoPrice } from '@/types/crypto';
import { applyIndicators, IndicatorData } from '@/lib/technicalIndicators';
import { IndicatorToggles, IndicatorState } from './IndicatorToggles';

interface PriceChartProps {
  price: CryptoPrice | null;
  isLoading?: boolean;
}

export function PriceChart({ price, isLoading }: PriceChartProps) {
  const [indicators, setIndicators] = useState<IndicatorState>({
    rsi: false,
    macd: false,
    bollinger: false,
  });

  const handleToggle = (indicator: keyof IndicatorState) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  // Generate simulated historical data based on current price
  const chartData = useMemo((): IndicatorData[] => {
    if (!price) return [];
    
    const points = 48; // More points for better indicator calculation
    const data = [];
    const basePrice = price.price;
    const volatility = Math.max(Math.abs(price.change24h) / 100, 0.02);
    
    for (let i = 0; i < points; i++) {
      const timeAgo = points - i;
      const randomFactor = (Math.random() - 0.5) * volatility * basePrice;
      const trendFactor = (price.change24h / 100) * basePrice * (i / points);
      const cycleFactor = Math.sin(i / 6) * volatility * basePrice * 0.3;
      const simulatedPrice = basePrice - trendFactor + randomFactor + cycleFactor;
      
      data.push({
        time: timeAgo <= 24 ? `${timeAgo}h` : `${Math.floor(timeAgo / 24)}d`,
        price: Math.max(simulatedPrice, basePrice * 0.85),
      });
    }
    
    // Add current price as last point
    data.push({
      time: 'Now',
      price: basePrice,
    });
    
    // Apply technical indicators
    return applyIndicators(data);
  }, [price]);

  if (isLoading) {
    return (
      <div className="cyber-card p-6 h-[400px] animate-pulse">
        <div className="h-full bg-muted rounded" />
      </div>
    );
  }

  if (!price) {
    return (
      <div className="cyber-card p-6 h-[400px] flex items-center justify-center">
        <span className="text-muted-foreground">Select a coin to view chart</span>
      </div>
    );
  }

  const isPositive = price.change24h >= 0;
  const strokeColor = isPositive ? 'hsl(145, 100%, 50%)' : 'hsl(0, 85%, 55%)';
  const fillColor = isPositive ? 'url(#greenGradient)' : 'url(#redGradient)';

  const showSubChart = indicators.rsi || indicators.macd;
  const mainChartHeight = showSubChart ? 200 : 280;

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {price.symbol}
            <span className="text-muted-foreground font-normal text-lg ml-2">
              / USD
            </span>
          </h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-mono text-3xl font-bold">
              ${price.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: price.price < 1 ? 6 : 2
              })}
            </span>
            <span className={`text-lg font-semibold ${isPositive ? 'status-bullish' : 'status-bearish'}`}>
              {isPositive ? '+' : ''}{price.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="text-right text-sm text-muted-foreground">
          <div>Vol 24h</div>
          <div className="font-mono">${(price.volume24h / 1e9).toFixed(2)}B</div>
        </div>
      </div>

      <IndicatorToggles indicators={indicators} onToggle={handleToggle} />

      {/* Main Price Chart with Bollinger Bands */}
      <div className={`mt-4 chart-glow`} style={{ height: mainChartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 100%, 50%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(145, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(280, 70%, 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(280, 70%, 60%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="hsl(180, 40%, 30%)" 
              tick={{ fill: 'hsl(180, 40%, 60%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(230, 30%, 18%)' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']}
              stroke="hsl(180, 40%, 30%)"
              tick={{ fill: 'hsl(180, 40%, 60%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(230, 30%, 18%)' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(230, 30%, 10%)',
                border: '1px solid hsl(180, 100%, 50%)',
                borderRadius: '8px',
                boxShadow: '0 0 20px hsl(180, 100%, 50%, 0.3)',
              }}
              labelStyle={{ color: 'hsl(180, 100%, 90%)' }}
              formatter={(value: number, name: string) => {
                if (name === 'price') return [`$${value.toLocaleString()}`, 'Price'];
                if (name === 'upperBand') return [`$${value.toLocaleString()}`, 'Upper BB'];
                if (name === 'lowerBand') return [`$${value.toLocaleString()}`, 'Lower BB'];
                if (name === 'middleBand') return [`$${value.toLocaleString()}`, 'Middle BB'];
                return [value, name];
              }}
            />
            
            {/* Bollinger Bands */}
            {indicators.bollinger && (
              <>
                <Area
                  type="monotone"
                  dataKey="upperBand"
                  stroke="hsl(280, 70%, 60%)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="none"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="hsl(280, 70%, 60%)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="url(#bollingerGradient)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="middleBand"
                  stroke="hsl(280, 70%, 50%)"
                  strokeWidth={1}
                  dot={false}
                />
              </>
            )}
            
            {/* Main Price Line */}
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill={fillColor}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI / MACD Sub-chart */}
      {showSubChart && (
        <div className="mt-2 border-t border-border pt-2" style={{ height: 120 }}>
          <div className="flex items-center gap-4 mb-1 text-xs text-muted-foreground">
            {indicators.rsi && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> RSI</span>}
            {indicators.macd && (
              <>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> MACD</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Signal</span>
              </>
            )}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                stroke="hsl(180, 40%, 30%)" 
                tick={{ fill: 'hsl(180, 40%, 60%)', fontSize: 9 }}
                axisLine={{ stroke: 'hsl(230, 30%, 18%)' }}
                interval="preserveStartEnd"
                hide
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(180, 40%, 30%)"
                tick={{ fill: 'hsl(180, 40%, 60%)', fontSize: 9 }}
                axisLine={{ stroke: 'hsl(230, 30%, 18%)' }}
                width={30}
                ticks={[20, 50, 80]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(230, 30%, 10%)',
                  border: '1px solid hsl(180, 100%, 50%)',
                  borderRadius: '8px',
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => {
                  if (typeof value !== 'number') return ['-', name];
                  return [value.toFixed(1), name.toUpperCase()];
                }}
              />
              
              {/* RSI reference lines */}
              {indicators.rsi && (
                <>
                  <ReferenceLine y={70} stroke="hsl(0, 85%, 55%)" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={30} stroke="hsl(145, 100%, 50%)" strokeDasharray="3 3" strokeOpacity={0.5} />
                </>
              )}
              
              {/* MACD Histogram */}
              {indicators.macd && (
                <Bar 
                  dataKey="histogram" 
                  fill="hsl(180, 100%, 40%)"
                  opacity={0.5}
                />
              )}
              
              {/* RSI Line */}
              {indicators.rsi && (
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="hsl(180, 100%, 50%)"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              )}
              
              {/* MACD Lines */}
              {indicators.macd && (
                <>
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="hsl(320, 100%, 60%)"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="hsl(45, 100%, 50%)"
                    strokeWidth={1}
                    dot={false}
                    connectNulls
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
