import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChartDataPoint } from '../types';

interface StockChartProps {
  data: ChartDataPoint[];
  entryPrice: number;
  stopLoss: number;
  targets: { price: number; label: string }[];
}

const StockChart: React.FC<StockChartProps> = ({ data, entryPrice, stopLoss, targets }) => {
  const minPrice = Math.min(...data.map(d => d.price), stopLoss) * 0.95;
  const maxPrice = Math.max(...data.map(d => d.price), ...targets.map(t => t.price)) * 1.05;

  return (
    <div className="w-full h-[300px] md:h-[400px] bg-slate-900/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-400 text-xs font-semibold uppercase mb-4 tracking-wider">30-Day Trend & Key Levels</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
            tick={{fontSize: 12}} 
            tickMargin={10}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            itemStyle={{ color: '#3b82f6' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
          
          {/* Key Levels Visualization */}
          <ReferenceLine y={entryPrice} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'ENTRY', fill: '#10b981', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={stopLoss} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'STOP', fill: '#ef4444', fontSize: 10, position: 'right' }} />
          {targets.map((target, idx) => (
             <ReferenceLine key={idx} y={target.price} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `T${idx + 1}`, fill: '#f59e0b', fontSize: 10, position: 'right' }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;