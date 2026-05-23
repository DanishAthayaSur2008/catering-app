/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/pengiriman/detail-logistik-fields.tsx
"use client"; // 👈 Kunci utama isolasi dari Server Component

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Truck, Copy } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"; // sesuaikan import ui Anda
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DetailLogistikFieldsProps {
  form: UseFormReturn<any>;
}

export function DetailLogistikFields({ form }: DetailLogistikFieldsProps) {
  const handleGenerateResi = () => {
    const newResi = `RESI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    form.setValue("noResi", newResi, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
        <Truck className="h-4 w-4" />
        Detail Pelacakan & Logistik
      </h4>

      {/* No. Resi */}
      <FormField
        control={form.control}
        name="noResi"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>No. Resi / Tracking</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateResi}
                className="h-7 text-xs"
              >
                Generate
              </Button>
            </div>
            <div className="flex gap-2">
              <FormControl>
                <Input placeholder="RESI-XXXX-XXXX" {...field} className="font-mono" />
              </FormControl>
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(field.value)}
                  title="Salin No. Resi"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Alamat Tujuan */}
      <FormField
        control={form.control}
        name="alamatTujuan"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Alamat Tujuan Khusus (Opsional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Masukkan alamat pengantaran spesifik jika berbeda dari profil pelanggan..."
                {...field}
                className="resize-none"
                rows={2}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Kosongkan jika ingin disamakan dengan alamat default pelanggan.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estimasi Tiba */}
      <FormField
        control={form.control}
        name="estimasiTiba"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Estimasi Waktu Tiba</FormLabel>
            <FormControl>
              <Input type="date" {...field} min={new Date().toISOString().split("T")[0]} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}