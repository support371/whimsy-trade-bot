import { useState } from 'react';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CryptoPrice } from '@/types/crypto';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateAlertFormProps {
  prices: CryptoPrice[];
  onCreateAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => Promise<{ error: Error | null }>;
}

export function CreateAlertForm({ prices, onCreateAlert }: CreateAlertFormProps) {
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPrice = prices.find(p => p.id === symbol);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !targetPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    const { error } = await onCreateAlert(symbol, price, condition);
    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to create alert');
    } else {
      toast.success(`Alert created for ${symbol.toUpperCase()}`);
      setSymbol('');
      setTargetPrice('');
    }
  };

  return (
    <div className="cyber-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Create Price Alert</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs">Asset</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="bg-input border-border font-mono">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {prices.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="font-mono">
                    {p.symbol.toUpperCase()} - ${p.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs">Condition</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCondition('above')}
                className={cn(
                  "flex-1 gap-1 font-mono",
                  condition === 'above' 
                    ? "bg-accent/20 border-accent text-accent" 
                    : "border-border"
                )}
              >
                <TrendingUp className="w-3 h-3" />
                Above
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCondition('below')}
                className={cn(
                  "flex-1 gap-1 font-mono",
                  condition === 'below' 
                    ? "bg-destructive/20 border-destructive text-destructive" 
                    : "border-border"
                )}
              >
                <TrendingDown className="w-3 h-3" />
                Below
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-xs">Target Price (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              step="any"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="pl-7 bg-input border-border font-mono"
              placeholder={selectedPrice?.price.toString() || '0.00'}
            />
          </div>
          {selectedPrice && (
            <p className="text-xs text-muted-foreground font-mono">
              Current: ${selectedPrice.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !symbol || !targetPrice}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? 'Creating...' : 'Create Alert'}
        </Button>
      </form>
    </div>
  );
}
