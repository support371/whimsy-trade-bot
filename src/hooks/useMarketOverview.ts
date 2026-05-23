import { useQuery } from "@tanstack/react-query";

export interface MarketOverview {
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

async function fetchMarketOverview(): Promise<MarketOverview> {
  const res = await fetch("https://api.coingecko.com/api/v3/global");
  if (!res.ok) throw new Error(`CoinGecko global failed: ${res.status}`);
  const json = await res.json();
  const d = json.data ?? {};
  return {
    totalMarketCapUsd: d.total_market_cap?.usd ?? 0,
    totalVolumeUsd: d.total_volume?.usd ?? 0,
    btcDominance: d.market_cap_percentage?.btc ?? 0,
    ethDominance: d.market_cap_percentage?.eth ?? 0,
    activeCryptos: d.active_cryptocurrencies ?? 0,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd ?? 0,
  };
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ["market-overview"],
    queryFn: fetchMarketOverview,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
