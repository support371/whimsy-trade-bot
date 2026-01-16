import { Bell, BellRing } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { CreateAlertForm } from '@/components/alerts/CreateAlertForm';
import { AlertsList } from '@/components/alerts/AlertsList';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useState, useEffect } from 'react';
import { SettingsModal, UserSettings, DEFAULT_SETTINGS } from '@/components/dashboard/SettingsModal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Alerts = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const { prices } = useCryptoPrices();
  const { 
    alerts, 
    isLoading, 
    createAlert, 
    deleteAlert,
    activeAlerts,
    triggeredAlerts,
  } = usePriceAlerts(prices);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
      }
    }
  };

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
    toast.success('Settings updated successfully');
  };

  return (
    <div className="min-h-screen bg-background scanlines">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <Navigation />
      
      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Notification Permission Banner */}
        {notificationPermission === 'default' && (
          <div className="cyber-card p-4 border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-mono text-sm">Enable browser notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified even when this tab is in the background
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRequestPermission}
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                Enable
              </Button>
            </div>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="cyber-card p-4 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-mono text-sm text-destructive">Browser notifications blocked</p>
                <p className="text-xs text-muted-foreground">
                  In-app alerts will still work. Enable in browser settings for push notifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="cyber-card p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">
              Total Alerts
            </div>
            <div className="font-display text-2xl font-bold text-primary">
              {alerts.length}
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">
              Active
            </div>
            <div className="font-display text-2xl font-bold text-accent">
              {activeAlerts.length}
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">
              Triggered
            </div>
            <div className="font-display text-2xl font-bold text-secondary">
              {triggeredAlerts.length}
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">
              Push Status
            </div>
            <div className="font-display text-lg font-bold">
              {notificationPermission === 'granted' ? (
                <span className="text-accent">Enabled</span>
              ) : notificationPermission === 'denied' ? (
                <span className="text-destructive">Blocked</span>
              ) : (
                <span className="text-muted-foreground">Pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreateAlertForm 
              prices={prices}
              onCreateAlert={createAlert}
            />
          </div>
          <div className="lg:col-span-2">
            <AlertsList 
              alerts={alerts}
              prices={prices}
              onDelete={deleteAlert}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/20 py-4 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
          <span>LOVABLE AI RISK AGENT v1.0 // PRICE ALERTS</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
        </div>
      </footer>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default Alerts;
