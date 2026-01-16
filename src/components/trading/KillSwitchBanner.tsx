import { AlertTriangle, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KillSwitchBannerProps {
  isActive: boolean;
  reason?: string;
  onReset: () => void;
  isResetting?: boolean;
}

export function KillSwitchBanner({ isActive, reason, onReset, isResetting }: KillSwitchBannerProps) {
  if (!isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/95 text-destructive-foreground py-3 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldOff className="w-6 h-6 animate-pulse" />
          <div>
            <span className="font-display font-bold text-sm uppercase tracking-wider">
              KILL SWITCH ACTIVATED
            </span>
            {reason && (
              <p className="text-xs opacity-90 mt-0.5">{reason}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isResetting}
          className="bg-transparent border-destructive-foreground text-destructive-foreground hover:bg-destructive-foreground/10"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {isResetting ? 'Resetting...' : 'Reset Kill Switch'}
        </Button>
      </div>
    </div>
  );
}
