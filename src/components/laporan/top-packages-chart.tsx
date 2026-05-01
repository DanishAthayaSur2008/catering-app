/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/laporan/top-packages-chart.tsx
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

interface TopPackagesChartProps {
  data: { name: string; terjual: number; revenue: number }[];
}

export function TopPackagesChart({ data }: TopPackagesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis 
          type="number" 
          tickFormatter={(value) => `${value}`}
          stroke="#64748b" 
          fontSize={12} 
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={11} 
          width={70}
          tickLine={false}
        />
        {/* ✅ FIX: Formatter dengan tipe yang compatible */}
        <Tooltip
          formatter={(value: any, name?: string | number) =>
            name === "revenue" ? formatRupiah(Number(value) || 0) : `${Number(value) || 0} porsi`
          }
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        />
        <Bar 
          dataKey="terjual" 
          fill="hsl(var(--primary))" 
          radius={[0, 4, 4, 0]} 
          name="Terjual"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}