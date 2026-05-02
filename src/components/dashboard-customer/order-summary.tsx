// src/components/dashboard-customer/order-summary.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderSummaryProps {
  orders: Array<{
    id: number;
    status: string;
    total: number;
    date: string;
  }>;
}

export function OrderSummary({ orders }: OrderSummaryProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Menunggu_Konfirmasi": "bg-yellow-100 text-yellow-800",
      "Sedang_Diproses": "bg-blue-100 text-blue-800",
      "Menunggu_Kurir": "bg-purple-100 text-purple-800",
      "Selesai": "bg-green-100 text-green-800",
      "Dibatalkan": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-2 rounded border">
            <div>
              <p className="font-medium text-sm">#{order.id}</p>
              <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
              <p className="text-xs font-semibold mt-1">
                Rp {(order.total / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}