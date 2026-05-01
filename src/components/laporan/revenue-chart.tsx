/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/laporan/revenue-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface RevenueChartProps {
  data: { name: string; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12} 
          tickLine={false} 
        />
        <YAxis 
          tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}J`}
          stroke="#64748b" 
          fontSize={12} 
          tickLine={false} 
        />
        {/* ✅ FIX: Formatter dengan tipe yang compatible */}
        <Tooltip 
          formatter={(value: any) => formatRupiah(Number(value) || 0)}
          contentStyle={{ 
            backgroundColor: "#fff", 
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
          }}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}