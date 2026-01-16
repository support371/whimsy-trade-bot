import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TradeModeToggle } from './TradeModeToggle';
import { RiskWarnings } from './RiskWarnings';
import { useRiskCheck, useExecuteTrade, useTradingConfig } from '@/hooks/useTrading';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { toast } from 'sonner';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import type { Side, OrderType, TradingMode, RiskCheck } from '@/types/trading';

const SYMBOLS = [
  { id: 'bitcoin', symbol: 'BTCUSDT', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETHUSDT', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOLUSDT', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNBUSDT', name: 'BNB' },
];

export function TradeForm() {
  const { prices } = useCryptoPrices();
  const { config, updateConfig } = useTradingConfig();
  const { checkRisk, isChecking } = useRiskCheck();
  const { executePaperTrade, isExecuting } = useExecuteTrade();

  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<Side>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState('0.001');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [mode, setMode] = useState<TradingMode>('paper');
  const [riskChecks, setRiskChecks] = useState<RiskCheck[]>([]);

  const selectedCoin = prices.find(p => 
    SYMBOLS.find(s => s.symbol === symbol)?.id === p.id
  );
  const currentPrice = selectedCoin?.price || 0;

  useEffect(() => {
    if (config?.trading_mode) {
      setMode(config.trading_mode);
    }
  }, [config?.trading_mode]);

  useEffect(() => {
    if (orderType === 'MARKET' && currentPrice > 0) {
      setPrice(currentPrice.toString());
    }
  }, [orderType, currentPrice]);

  const handleModeChange = async (newMode: TradingMode) => {
    if (newMode === 'live') {
      const confirmed = window.confirm(
        'WARNING: You are switching to LIVE trading mode.\n\n' +
        'This will execute REAL trades with REAL money on your connected exchange.\n\n' +
        'Are you absolutely sure you want to continue?'
      );
      if (!confirmed) return;
    }
    
    try {
      await updateConfig({ trading_mode: newMode });
      setMode(newMode);
      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
    } catch (err) {
      toast.error('Failed to update trading mode');
    }
  };

  const handleCheckRisk = async () => {
    const result = await checkRisk({
      symbol,
      side,
      quantity: parseFloat(quantity),
      price: parseFloat(price) || currentPrice,
      leverage: parseInt(leverage),
      volatility: Math.abs(selectedCoin?.change24h || 0) / 100
    });
    setRiskChecks(result.checks);
    return result.passed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPrice) {
      toast.error('Unable to get current price');
      return;
    }

    const passed = await handleCheckRisk();
    
    if (!passed) {
      toast.error('Trade blocked by risk engine');
      return;
    }

    if (mode === 'live') {
      toast.error('Live trading requires Python backend connection');
      return;
    }

    try {
      const result = await executePaperTrade(
        {
          symbol,
          side,
          order_type: orderType,
          quantity: parseFloat(quantity),
          price: parseFloat(price) || currentPrice,
          time_in_force: 'GTC',
          leverage: parseInt(leverage)
        },
        {
          symbol,
          side,
          quantity: parseFloat(quantity),
          price: currentPrice,
          account_balance: config?.base_capital || 1000,
          open_positions_value: 0,
          daily_pnl: 0,
          volatility: Math.abs(selectedCoin?.change24h || 0) / 100
        }
      );

      if (result?.success) {
        toast.success(result.message);
        setQuantity('0.001');
      } else {
        toast.error(result?.message || 'Trade failed');
      }
    } catch (err) {
      toast.error('Failed to execute trade');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TradeModeToggle 
        mode={mode} 
        onModeChange={handleModeChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">SYMBOL</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="cyber-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map(s => (
                <SelectItem key={s.symbol} value={s.symbol}>
                  {s.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">ORDER TYPE</Label>
          <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
            <SelectTrigger className="cyber-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MARKET">MARKET</SelectItem>
              <SelectItem value="LIMIT">LIMIT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">QUANTITY</Label>
          <Input
            type="number"
            step="0.0001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="cyber-card font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">
            {orderType === 'LIMIT' ? 'LIMIT PRICE' : 'MARKET PRICE'}
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price || currentPrice.toFixed(2)}
            onChange={(e) => setPrice(e.target.value)}
            disabled={orderType === 'MARKET'}
            className="cyber-card font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-mono text-muted-foreground">LEVERAGE</Label>
        <Select value={leverage} onValueChange={setLeverage}>
          <SelectTrigger className="cyber-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 5, 10].map(l => (
              <SelectItem key={l} value={l.toString()}>{l}x</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RiskWarnings checks={riskChecks} isLoading={isChecking} />

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => {
            setSide('BUY');
            handleCheckRisk();
          }}
          variant={side === 'BUY' ? 'default' : 'outline'}
          className={`h-14 font-display text-lg ${side === 'BUY' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
        >
          BUY / LONG
        </Button>
        <Button
          type="button"
          onClick={() => {
            setSide('SELL');
            handleCheckRisk();
          }}
          variant={side === 'SELL' ? 'default' : 'outline'}
          className={`h-14 font-display text-lg ${side === 'SELL' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
        >
          SELL / SHORT
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isExecuting || isChecking}
        className="w-full h-12 font-display text-lg"
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            EXECUTING...
          </>
        ) : (
          <>
            <ArrowDownUp className="w-5 h-5 mr-2" />
            EXECUTE {side} {mode.toUpperCase()}
          </>
        )}
      </Button>
    </form>
  );
}
