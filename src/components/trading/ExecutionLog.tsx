import { useEffect, useState } from 'react';
import { useTradingAudit } from '@/hooks/useTrading';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ExecutionIntent, IntentStatus } from '@/types/trading';

const statusConfig: Record<IntentStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  RECEIVED: { icon: Clock, color: 'text-muted-foreground', label: 'Received' },
  VALIDATED: { icon: Clock, color: 'text-primary', label: 'Validated' },
  REJECTED_RISK: { icon: XCircle, color: 'text-destructive', label: 'Risk Rejected' },
  EXECUTING: { icon: Clock, color: 'text-warning', label: 'Executing' },
  PARTIALLY_FILLED: { icon: AlertTriangle, color: 'text-warning', label: 'Partial' },
  FILLED: { icon: CheckCircle, color: 'text-accent', label: 'Filled' },
  FAILED: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
  CANCELLED: { icon: XCircle, color: 'text-muted-foreground', label: 'Cancelled' },
};

export function ExecutionLog() {
  const { fetchAudit, isLoading } = useTradingAudit();
  const [intents, setIntents] = useState<ExecutionIntent[]>([]);

  const loadIntents = async () => {
    const data = await fetchAudit('intents', 20);
    if (data?.data) {
      setIntents(data.data as ExecutionIntent[]);
    }
  };

  useEffect(() => {
    loadIntents();
  }, []);

  return (
    <div className="cyber-card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-primary">EXECUTION LOG</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadIntents}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {intents.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No executions yet
            </div>
          )}
          
          {intents.map((intent) => {
            const status = intent.status as IntentStatus;
            const statusInfo = statusConfig[status] || statusConfig.RECEIVED;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={intent.id}
                className="p-3 rounded-lg bg-muted/30 border border-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={intent.side === 'BUY' ? 'default' : 'destructive'}
                      className="font-mono text-xs"
                    >
                      {intent.side}
                    </Badge>
                    <span className="font-mono text-sm">{intent.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {intent.mode?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="text-xs font-mono">{statusInfo.label}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>QTY: {intent.quantity}</span>
                  <span>@ ${intent.price?.toLocaleString()}</span>
                  <span>{intent.leverage}x</span>
                </div>

                {intent.notes && (
                  <p className="text-xs text-muted-foreground truncate">
                    {intent.notes}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  {new Date(intent.created_at!).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
