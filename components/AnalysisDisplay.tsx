import React from 'react';
import { AnalysisResult } from '../types';
import StockChart from './StockChart';
import { TrendingUp, TrendingDown, AlertCircle, Target, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

interface AnalysisDisplayProps {
  data: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data }) => {
  const isProfitPotential = data.targets[1].price > data.currentPrice;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            {data.symbol}
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {data.currency}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">Technical Analysis Report</p>
        </div>
        <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Current Price</div>
            <div className={`text-4xl font-mono font-bold ${isProfitPotential ? 'text-emerald-400' : 'text-red-400'}`}>
              ${data.currentPrice.toFixed(2)}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Key Levels Card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Entry & Stop Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-white">Strategy Setup</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">Suggested Entry</div>
                <div className="text-2xl font-bold text-white">${data.entryPrice.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{data.entryReason}</p>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Stop Loss</div>
                <div className="text-2xl font-bold text-white">${data.stopLoss.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{data.stopLossReason}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 text-sm">R/R Ratio</span>
              <span className="text-white font-mono font-bold bg-slate-700 px-2 py-1 rounded">{data.riskRewardRatio}</span>
            </div>
          </div>

          {/* Targets Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-white">Exit Targets</h3>
            </div>
            <div className="space-y-3">
              {data.targets.map((target, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{target.label}</div>
                    {target.description && <div className="text-xs text-slate-500">{target.description}</div>}
                  </div>
                  <div className="text-lg font-bold text-amber-400 font-mono">${target.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Chart & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <StockChart 
            data={data.chartData} 
            entryPrice={data.entryPrice} 
            stopLoss={data.stopLoss} 
            targets={data.targets} 
          />

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-white">Analysis Summary</h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              {data.summary}
            </p>
            
            {/* Technical Levels Tags */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-700 pt-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Support Zones</span>
                <div className="flex flex-wrap gap-2">
                  {data.supportLevels.map((lvl, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-700 text-emerald-400 text-xs font-mono rounded border border-slate-600">
                      ${lvl.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Resistance Zones</span>
                 <div className="flex flex-wrap gap-2">
                  {data.resistanceLevels.map((lvl, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-700 text-red-400 text-xs font-mono rounded border border-slate-600">
                      ${lvl.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sources Section */}
            {data.sources && data.sources.length > 0 && (
              <div className="mt-6 border-t border-slate-700 pt-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data.sources.slice(0, 6).map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded bg-slate-900/50 hover:bg-slate-700 transition-colors group"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                      <span className="text-xs text-slate-400 group-hover:text-blue-300 truncate">
                        {source.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-lg flex gap-3 items-start opacity-75">
        <ShieldAlert className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Disclaimer:</strong> This analysis is generated by AI for informational purposes only and does not constitute financial advice. 
          Stock market trading involves substantial risk of loss. Past performance is not indicative of future results. 
          Always conduct your own due diligence and consult with a certified financial advisor before making any investment decisions.
        </p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;