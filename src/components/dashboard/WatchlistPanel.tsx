import { useState } from 'react';
import { Star, TrendingUp, TrendingDown, Minus, X, Eye, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CryptoPrice } from '@/types/crypto';
import { WatchlistItem } from '@/hooks/useWatchlist';

interface WatchlistPanelProps {
  watchlist: WatchlistItem[];
  prices: CryptoPrice[];
  selectedSymbol: string;
  onSelect: (id: string) => void;
  onRemove: (symbol: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isLoading?: boolean;
}

export function WatchlistPanel({
  watchlist,
  prices,
  selectedSymbol,
  onSelect,
  onRemove,
  onReorder,
  isLoading = false,
}: WatchlistPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getPriceData = (symbol: string) => {
    return prices.find(p => p.symbol === symbol);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    // Add a slight delay to allow the drag image to be captured
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            My Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (watchlist.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            My Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Eye className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No coins in your watchlist</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click the star icon on any coin to add it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          My Watchlist
          <span className="text-xs text-muted-foreground font-normal">
            ({watchlist.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-1 px-4 pb-4">
            {watchlist.map((item, index) => {
              const priceData = getPriceData(item.symbol);
              const isSelected = priceData?.id === selectedSymbol;
              const isPositive = priceData && priceData.change24h >= 0;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-all",
                    "hover:bg-muted/50 cursor-pointer group",
                    isSelected && "bg-muted/50 border border-primary/50",
                    isDragging && "opacity-50",
                    isDragOver && "border-t-2 border-t-primary"
                  )}
                  onClick={() => priceData && onSelect(priceData.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-display text-sm font-semibold",
                        isSelected && "text-primary"
                      )}>
                        {item.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {priceData ? (
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm font-medium">
                          ${priceData.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: priceData.price < 1 ? 6 : 2,
                          })}
                        </span>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          isPositive ? "text-accent" : "text-destructive"
                        )}>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : priceData.change24h < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}
                            {priceData.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Loading...
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.symbol);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
