/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/laporan/status-pie-chart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StatusPieChartProps {
  data: { name: string; value: number; total: number }[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => 
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* ✅ FIX: Formatter dengan tipe yang compatible */}
        <Tooltip formatter={(value: any) => `${Number(value) || 0} pesanan`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}