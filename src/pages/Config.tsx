import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { useTradingConfig, useUpdateTradingConfig } from '@/hooks/useTrading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Settings, Shield, Wallet, AlertTriangle, Network } from 'lucide-react';

const Config = () => {
  const { config, isLoading } = useTradingConfig();
  const updateConfig = useUpdateTradingConfig();
  
  const [formData, setFormData] = useState({
    base_capital: config?.base_capital || 1000,
    max_risk_per_trade: config?.max_risk_per_trade || 0.02,
    max_daily_loss: config?.max_daily_loss || 50,
    volatility_limit: config?.volatility_limit || 0.05,
    max_leverage: config?.max_leverage || 3,
    max_slippage: config?.max_slippage || 0.01,
    profit_withdrawal_threshold: config?.profit_withdrawal_threshold || 200,
    kill_switch_max_api_errors: config?.kill_switch_max_api_errors || 10,
    kill_switch_max_failed_orders: config?.kill_switch_max_failed_orders || 5,
    trading_mode: config?.trading_mode || 'paper',
    network: config?.network || 'testnet',
    exchange: config?.exchange || 'binance',
    withdraw_address: config?.withdraw_address || '',
    withdraw_asset: config?.withdraw_asset || 'USDT',
  });

  // Update form when config loads
  useState(() => {
    if (config) {
      setFormData({
        base_capital: config.base_capital,
        max_risk_per_trade: config.max_risk_per_trade,
        max_daily_loss: config.max_daily_loss,
        volatility_limit: config.volatility_limit,
        max_leverage: config.max_leverage,
        max_slippage: config.max_slippage,
        profit_withdrawal_threshold: config.profit_withdrawal_threshold,
        kill_switch_max_api_errors: config.kill_switch_max_api_errors,
        kill_switch_max_failed_orders: config.kill_switch_max_failed_orders,
        trading_mode: config.trading_mode,
        network: config.network,
        exchange: config.exchange,
        withdraw_address: config.withdraw_address || '',
        withdraw_asset: config.withdraw_asset || 'USDT',
      });
    }
  });

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(formData);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background scanlines">
        <Header onSettingsClick={() => {}} />
        <Navigation />
        <main className="container mx-auto p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scanlines">
      <Header onSettingsClick={() => {}} />
      <Navigation />

      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-primary neon-glow flex items-center gap-2">
            <Settings className="w-6 h-6" />
            TRADING CONFIGURATION
          </h1>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capital & Trading Settings */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Wallet className="w-5 h-5" />
                Capital Settings
              </CardTitle>
              <CardDescription>Configure your trading capital and mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base_capital">Base Capital ($)</Label>
                <Input
                  id="base_capital"
                  type="number"
                  value={formData.base_capital}
                  onChange={(e) => setFormData({ ...formData, base_capital: parseFloat(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trading_mode">Trading Mode</Label>
                <Select
                  value={formData.trading_mode}
                  onValueChange={(value: 'paper' | 'live') => setFormData({ ...formData, trading_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">Paper Trading</SelectItem>
                    <SelectItem value="live">Live Trading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value: 'testnet' | 'mainnet') => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testnet">Testnet</SelectItem>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exchange">Exchange</Label>
                <Select
                  value={formData.exchange}
                  onValueChange={(value) => setFormData({ ...formData, exchange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Risk Settings */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Shield className="w-5 h-5" />
                Risk Management
              </CardTitle>
              <CardDescription>Configure risk limits and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max_risk_per_trade">Max Risk Per Trade (%)</Label>
                <Input
                  id="max_risk_per_trade"
                  type="number"
                  step="0.01"
                  value={(formData.max_risk_per_trade * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, max_risk_per_trade: parseFloat(e.target.value) / 100 })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_daily_loss">Max Daily Loss ($)</Label>
                <Input
                  id="max_daily_loss"
                  type="number"
                  value={formData.max_daily_loss}
                  onChange={(e) => setFormData({ ...formData, max_daily_loss: parseFloat(e.target.value) })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volatility_limit">Volatility Limit (%)</Label>
                <Input
                  id="volatility_limit"
                  type="number"
                  step="0.01"
                  value={(formData.volatility_limit * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, volatility_limit: parseFloat(e.target.value) / 100 })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_leverage">Max Leverage</Label>
                <Input
                  id="max_leverage"
                  type="number"
                  value={formData.max_leverage}
                  onChange={(e) => setFormData({ ...formData, max_leverage: parseInt(e.target.value) })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_slippage">Max Slippage (%)</Label>
                <Input
                  id="max_slippage"
                  type="number"
                  step="0.01"
                  value={(formData.max_slippage * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, max_slippage: parseFloat(e.target.value) / 100 })}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Kill Switch Settings */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Kill Switch
              </CardTitle>
              <CardDescription>Emergency stop conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kill_switch_max_api_errors">Max API Errors</Label>
                <Input
                  id="kill_switch_max_api_errors"
                  type="number"
                  value={formData.kill_switch_max_api_errors}
                  onChange={(e) => setFormData({ ...formData, kill_switch_max_api_errors: parseInt(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kill_switch_max_failed_orders">Max Failed Orders</Label>
                <Input
                  id="kill_switch_max_failed_orders"
                  type="number"
                  value={formData.kill_switch_max_failed_orders}
                  onChange={(e) => setFormData({ ...formData, kill_switch_max_failed_orders: parseInt(e.target.value) })}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Settings */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Network className="w-5 h-5" />
                Profit Withdrawal
              </CardTitle>
              <CardDescription>Auto-withdrawal settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profit_withdrawal_threshold">Withdrawal Threshold ($)</Label>
                <Input
                  id="profit_withdrawal_threshold"
                  type="number"
                  value={formData.profit_withdrawal_threshold}
                  onChange={(e) => setFormData({ ...formData, profit_withdrawal_threshold: parseFloat(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="withdraw_asset">Withdrawal Asset</Label>
                <Input
                  id="withdraw_asset"
                  type="text"
                  value={formData.withdraw_asset}
                  onChange={(e) => setFormData({ ...formData, withdraw_asset: e.target.value })}
                  className="font-mono"
                  placeholder="USDT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw_address">Withdrawal Address</Label>
                <Input
                  id="withdraw_address"
                  type="text"
                  value={formData.withdraw_address}
                  onChange={(e) => setFormData({ ...formData, withdraw_address: e.target.value })}
                  className="font-mono"
                  placeholder="Your wallet address"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Config;
