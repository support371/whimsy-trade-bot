import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { useExecutionIntents, useRiskEvents, useSystemHealth } from '@/hooks/useTrading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertTriangle, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    RECEIVED: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    VALIDATED: { variant: 'secondary', icon: <CheckCircle className="w-3 h-3" /> },
    EXECUTING: { variant: 'default', icon: <Activity className="w-3 h-3" /> },
    FILLED: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
    PARTIALLY_FILLED: { variant: 'secondary', icon: <Activity className="w-3 h-3" /> },
    REJECTED_RISK: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    FAILED: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    CANCELLED: { variant: 'outline', icon: <XCircle className="w-3 h-3" /> },
  };

  const config = variants[status] || { variant: 'outline' as const, icon: null };

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 font-mono">
      {config.icon}
      {status}
    </Badge>
  );
};

const Status = () => {
  const { intents, isLoading: intentsLoading } = useExecutionIntents();
  const { events, isLoading: eventsLoading } = useRiskEvents();
  const { health, isLoading: healthLoading } = useSystemHealth();

  const isLoading = intentsLoading || eventsLoading || healthLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background scanlines">
        <Header onSettingsClick={() => {}} />
        <Navigation />
        <main className="container mx-auto p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  const rejectedEvents = events?.filter(e => !e.passed) || [];
  const passedEvents = events?.filter(e => e.passed) || [];

  return (
    <div className="min-h-screen bg-background scanlines">
      <Header onSettingsClick={() => {}} />
      <Navigation />

      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        <h1 className="font-display text-2xl text-primary neon-glow flex items-center gap-2">
          <FileText className="w-6 h-6" />
          SYSTEM STATUS & AUDIT
        </h1>

        {/* Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Kill Switch</div>
              <div className={`text-xl font-display ${health?.kill_switch_active ? 'text-destructive' : 'text-accent'}`}>
                {health?.kill_switch_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">API Errors</div>
              <div className="text-xl font-display">{health?.api_error_count || 0}</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Failed Orders</div>
              <div className="text-xl font-display">{health?.failed_order_count || 0}</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Last Check</div>
              <div className="text-sm font-mono">
                {health?.last_health_check 
                  ? format(new Date(health.last_health_check), 'HH:mm:ss')
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="rejections">Risk Rejections</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Execution Intents
                </CardTitle>
                <CardDescription>All trade orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {intents && intents.length > 0 ? (
                    <div className="space-y-2">
                      {intents.map((intent) => (
                        <div
                          key={intent.id}
                          className="flex items-center justify-between p-3 rounded border border-border bg-card/50"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-mono text-sm">{intent.symbol}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(intent.created_at), 'MMM dd, HH:mm:ss')}
                              </div>
                            </div>
                            <Badge variant={intent.side === 'BUY' ? 'default' : 'destructive'}>
                              {intent.side}
                            </Badge>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Qty:</span>{' '}
                              <span className="font-mono">{intent.quantity}</span>
                            </div>
                            {intent.price && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">@</span>{' '}
                                <span className="font-mono">${intent.price}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {intent.mode}
                            </Badge>
                            <StatusBadge status={intent.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No execution intents yet
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejections">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Risk Rejections
                </CardTitle>
                <CardDescription>Trades blocked by risk rules</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {rejectedEvents.length > 0 ? (
                    <div className="space-y-2">
                      {rejectedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded border border-destructive/30 bg-destructive/5"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="destructive">{event.rule}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                            </span>
                          </div>
                          {event.reason && (
                            <p className="text-sm text-muted-foreground mt-2">{event.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No risk rejections
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Full Audit Log
                </CardTitle>
                <CardDescription>All risk checks and events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {events && events.length > 0 ? (
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded border ${
                            event.passed 
                              ? 'border-accent/30 bg-accent/5' 
                              : 'border-destructive/30 bg-destructive/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {event.passed ? (
                                <CheckCircle className="w-4 h-4 text-accent" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <Badge variant="outline">{event.rule}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                            </span>
                          </div>
                          {event.reason && (
                            <p className="text-sm text-muted-foreground mt-2">{event.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No audit events yet
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Status;
