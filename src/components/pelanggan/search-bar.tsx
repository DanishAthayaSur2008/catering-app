"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter();

  return (
    <form 
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get("q") as string;
        router.push(`/pelanggan?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, telepon, atau alamat..."
          className="pl-10"
          defaultValue={defaultValue}
          name="q"
        />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Cari
      </Button>
    </form>
  );
}