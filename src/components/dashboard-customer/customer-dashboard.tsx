// src/components/dashboard-customer/customer-dashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

interface CustomerDashboardProps {
  stats: {
    activeOrders: number;
    pendingDelivery: number;
    completedOrders: number;
  };
  recentOrders?: Array<{
    id: number;
    status: string;
    total: number;
    date: string;
  }>;
}

export function CustomerDashboard({ stats, recentOrders = [] }: CustomerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Saya</h2>
          <p className="text-muted-foreground">Pantau pesanan & kelola akun katering Anda.</p>
        </div>
        <Button asChild>
          <Link href="/paket">
            <Plus className="mr-2 h-4 w-4" />
            Pesan Katering Baru
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Sedang diproses/dikirim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pengiriman Hari Ini</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDelivery}</div>
            <p className="text-xs text-muted-foreground">Estimasi tiba sore ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Total riwayat</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada pesanan. Yuk pesan katering pertama Anda!</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Pesanan #{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={
                      order.status === "Selesai" ? "default" :
                      order.status === "Menunggu_Konfirmasi" ? "secondary" :
                      "outline"
                    }>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-sm font-semibold">Rp {(order.total / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/pesanan">Lihat Semua Pesanan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/profil" className="flex flex-col items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-xs">Edit Profil</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/paket" className="flex flex-col items-center gap-2">
                <span className="text-lg">📦</span>
                <span className="text-xs">Lihat Paket</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/pesanan" className="flex flex-col items-center gap-2">
                <span className="text-lg">🛒</span>
                <span className="text-xs">Riwayat</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/pengiriman" className="flex flex-col items-center gap-2">
                <span className="text-lg">🚚</span>
                <span className="text-xs">Tracking</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}