export interface ChartDataPoint {
  date: string;
  price: number;
  sma50?: number;
  sma200?: number;
  rsi?: number;
  macdLine?: number;
  macdSignal?: number;
  macdHistogram?: number;
}

export interface Target {
  label: string;
  price: number;
  description?: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  symbol: string;
  currentPrice: number;
  currency: string;
  entryPrice: number;
  entryReason: string;
  stopLoss: number;
  stopLossReason: string;
  targets: Target[];
  riskRewardRatio: string;
  summary: string;
  supportLevels: number[];
  resistanceLevels: number[];
  chartData: ChartDataPoint[]; // Simulated or representative data for visualization
  sources?: Source[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum UserTier {
  GUEST = 'GUEST',
  PAID = 'PAID'
}

export interface UserProfile {
  id: string;
  tier: UserTier;
  email?: string;
}