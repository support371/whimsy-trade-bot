import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { TradingMode } from '@/types/trading';

interface TradeModeToggleProps {
  mode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  disabled?: boolean;
}

export function TradeModeToggle({ mode, onModeChange, disabled }: TradeModeToggleProps) {
  const isLive = mode === 'live';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      <span className={`text-sm font-mono ${!isLive ? 'text-primary' : 'text-muted-foreground'}`}>
        PAPER
      </span>
      <Switch
        checked={isLive}
        onCheckedChange={(checked) => onModeChange(checked ? 'live' : 'paper')}
        disabled={disabled}
        className="data-[state=checked]:bg-destructive"
      />
      <span className={`text-sm font-mono ${isLive ? 'text-destructive' : 'text-muted-foreground'}`}>
        LIVE
      </span>
      {isLive && (
        <Badge variant="destructive" className="ml-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          REAL MONEY
        </Badge>
      )}
    </div>
  );
}
