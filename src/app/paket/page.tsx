import { getPakets } from "@/app/actions/paket-actions";
import { PaketFormDialog } from "@/components/paket/paket-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { KATEGORI_PAKET } from "@/lib/validations/paket";

interface PaketPageProps {
    searchParams: Promise<{ q?: string; kategori?: string }>;
}

export default async function PaketPage({ searchParams }: PaketPageProps) {
    const params = await searchParams;
    const search = params?.q || "";
    const kategori = params?.kategori || "all";

    const pakets = await getPakets(search, kategori);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Paket Katering</h2>
                    <p className="text-muted-foreground">
                        Kelola menu dan harga paket katering Anda.
                    </p>
                </div>
                <PaketFormDialog mode="create" />
            </div>

            {/* Filters */}
            <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama paket atau menu..."
                        className="pl-10"
                        defaultValue={search}
                        name="q"
                    />
                </div>

                <Select name="kategori" defaultValue={kategori}>
                    <SelectTrigger className="w-full sm:w-45">
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {KATEGORI_PAKET.map((kat) => (
                            <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button type="submit" variant="secondary" size="sm">
                    Filter
                </Button>
            </form>

            {/* Package Grid */}
            {pakets.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pakets.map((p) => (
                        <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Image Header */}
                            <div className="relative h-40 bg-muted">
                                {p.foto ? (
                                    <Image
                                        src={p.foto}
                                        alt={p.namaPaket}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                <Badge className="absolute top-2 right-2 bg-primary/90">
                                    {p.kategori}
                                </Badge>
                            </div>

                            <CardHeader className="pb-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{p.namaPaket}</h3>
                            </CardHeader>

                            <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {p.menuPaket}
                                </p>
                                <p className="text-xl font-bold text-primary">
                                    {formatRupiah(p.hargaPaket)}
                                    <span className="text-xs font-normal text-muted-foreground">/porsi</span>
                                </p>
                            </CardContent>

                            <CardFooter className="flex justify-end gap-1 pt-2 border-t">
                                <PaketFormDialog
                                    paket={{
                                        id: p.id,
                                        namaPaket: p.namaPaket,
                                        menuPaket: p.menuPaket,
                                        kategori: p.kategori,
                                        hargaPaket: p.hargaPaket,
                                        foto: p.foto,
                                    }}
                                    mode="edit"
                                />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                        {search || kategori !== "all"
                            ? "Tidak ada paket yang cocok dengan filter."
                            : "Belum ada paket. Tambah yang pertama!"}
                    </p>
                </div>
            )}

            {/* Stats Footer */}
            <div className="text-sm text-muted-foreground">
                Menampilkan {pakets.length} paket
                {(search || kategori !== "all") && " (dengan filter)"}
            </div>
        </div>
    );
}