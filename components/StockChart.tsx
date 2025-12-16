import React, { useState } from 'react';
import {
  ComposedChart,
  LineChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { ChartDataPoint } from '../types';
import { Activity, Layers } from 'lucide-react';

interface StockChartProps {
  data: ChartDataPoint[];
  entryPrice: number;
  stopLoss: number;
  targets: { price: number; label: string }[];
}

const StockChart: React.FC<StockChartProps> = ({ data, entryPrice, stopLoss, targets }) => {
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  const minPrice = Math.min(...data.map(d => d.price), stopLoss) * 0.95;
  const maxPrice = Math.max(...data.map(d => d.price), ...targets.map(t => t.price)) * 1.05;

  return (
    <div className="flex flex-col gap-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Layers className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Indicators</span>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={showSMA50} 
              onChange={() => setShowSMA50(!showSMA50)}
              className="peer sr-only"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">SMA 50</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={showSMA200} 
              onChange={() => setShowSMA200(!showSMA200)}
              className="peer sr-only"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">SMA 200</span>
        </label>

        <div className="w-px h-6 bg-slate-700 mx-2"></div>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={showRSI} 
            onChange={() => setShowRSI(!showRSI)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">RSI</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={showMACD} 
            onChange={() => setShowMACD(!showMACD)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">MACD</span>
        </label>
      </div>

      {/* Main Price Chart with SMAs */}
      <div className="w-full h-[320px] bg-slate-900/50 rounded-xl border border-slate-700 p-4 transition-all duration-300">
        <h3 className="text-slate-400 text-xs font-semibold uppercase mb-2 tracking-wider">Price Action & Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            syncId="stockSync"
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              tick={{fontSize: 10}} 
              tickMargin={10}
              hide // Hide X axis on top chart to reduce clutter
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              stroke="#94a3b8" 
              tick={{fontSize: 11}}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
              width={50}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '12px' }}
              itemStyle={{ padding: 0 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
            />
            <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '12px' }}/>
            
            {/* Price Area */}
            <Area 
              name="Price"
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
            
            {/* Moving Averages */}
            {showSMA50 && (
              <Line 
                name="SMA 50"
                type="monotone" 
                dataKey="sma50" 
                stroke="#f59e0b" // Amber
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {showSMA200 && (
              <Line 
                name="SMA 200"
                type="monotone" 
                dataKey="sma200" 
                stroke="#a855f7" // Purple
                strokeWidth={1.5}
                dot={false}
              />
            )}
            
            {/* Key Levels Visualization */}
            <ReferenceLine y={entryPrice} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'ENTRY', fill: '#10b981', fontSize: 10, position: 'insideRight' }} />
            <ReferenceLine y={stopLoss} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'STOP', fill: '#ef4444', fontSize: 10, position: 'insideRight' }} />
            {targets.map((target, idx) => (
               <ReferenceLine key={idx} y={target.price} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `T${idx + 1}`, fill: '#f59e0b', fontSize: 10, position: 'insideRight' }} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      {showRSI && (
        <div className="w-full h-[150px] bg-slate-900/50 rounded-xl border border-slate-700 p-4 transition-all duration-300 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">RSI (14)</h3>
            <div className="text-[10px] text-slate-500 font-mono">
              <span className="text-emerald-500 mr-2">● Oversold (30)</span>
              <span className="text-red-500">● Overbought (70)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              syncId="stockSync"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{fontSize: 10}} 
                tickMargin={5}
                hide={showMACD} // Hide X axis if MACD is shown below it
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#94a3b8" 
                tick={{fontSize: 11}}
                ticks={[0, 30, 50, 70, 100]}
                width={50}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '12px' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [value.toFixed(2), 'RSI']}
              />
              
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
              
              <Line 
                type="monotone" 
                dataKey="rsi" 
                stroke="#22d3ee" // Cyan
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Chart */}
      {showMACD && (
        <div className="w-full h-[180px] bg-slate-900/50 rounded-xl border border-slate-700 p-4 transition-all duration-300 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">MACD (12, 26, 9)</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              syncId="stockSync"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{fontSize: 10}} 
                tickMargin={5}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{fontSize: 11}}
                width={50}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '12px' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number, name: string) => [value.toFixed(2), name]}
              />
              <ReferenceLine y={0} stroke="#475569" />
              
              <Bar dataKey="macdHistogram" name="Hist" fill="#64748b" opacity={0.5} />
              <Line 
                type="monotone" 
                dataKey="macdLine" 
                name="MACD"
                stroke="#3b82f6" // Blue
                strokeWidth={1.5}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="macdSignal" 
                name="Signal"
                stroke="#f97316" // Orange
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StockChart;