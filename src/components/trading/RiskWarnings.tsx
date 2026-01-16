import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { RiskCheck } from '@/types/trading';

interface RiskWarningsProps {
  checks: RiskCheck[];
  isLoading?: boolean;
}

export function RiskWarnings({ checks, isLoading }: RiskWarningsProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-mono">Checking risk parameters...</span>
        </div>
      </div>
    );
  }

  if (checks.length === 0) {
    return null;
  }

  const passed = checks.filter(c => c.passed);
  const failed = checks.filter(c => !c.passed);

  return (
    <div className="space-y-2">
      {failed.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-display font-bold">RISK VIOLATIONS</span>
          </div>
          <ul className="space-y-1">
            {failed.map((check, i) => (
              <li key={i} className="text-xs font-mono text-destructive/80">
                • {check.rule}: {check.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {passed.length > 0 && failed.length === 0 && (
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-display font-bold">ALL CHECKS PASSED</span>
          </div>
        </div>
      )}

      {passed.length > 0 && failed.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="text-xs font-mono text-muted-foreground">
            {passed.length} checks passed, {failed.length} failed
          </div>
        </div>
      )}
    </div>
  );
}
