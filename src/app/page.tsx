"use client";

import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Star, 
  UtensilsCrossed, 
  ArrowRight, 
  Play, 
  Heart 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ✅ Fix TypeScript error dengan mendefinisikan tipe Variants secara eksplisit
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] // Menggunakan cubic-bezier agar lebih smooth & Type Safe
    } 
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-600">
      
      {/* 🚀 Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter italic">
              Catering<span className="text-orange-500">Ku.</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/auth/login" 
              className="hidden sm:block text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors"
            >
              Masuk
            </Link>
            <Button asChild className="rounded-full bg-slate-900 px-6 font-bold hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 border-none">
              <Link href="/auth/register">Mulai Pesan</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 🔥 Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob [animation-delay:2s]" />
        </div>

        <motion.div 
          className="container mx-auto px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-orange-100">
            <Star className="h-3 w-3 fill-current" /> Rating 4.9/5 dari 1000+ Acara
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Hidangan <span className="text-orange-500">Mewah</span> <br />
            Tanpa Ribet.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
            Dari pernikahan megah hingga syukuran hangat di rumah. Kami antar kelezatan bintang 5 langsung ke meja Anda.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-orange-500 hover:bg-orange-600 text-lg font-black shadow-2xl shadow-orange-200 group border-none">
              <Link href="/auth/register" className="flex items-center gap-2">
                Pesan Sekarang <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-16 px-8 rounded-2xl font-bold gap-3 hover:bg-slate-50">
              <div className="h-10 w-10 bg-white shadow-md rounded-full flex items-center justify-center border border-slate-100 text-orange-500">
                <Play className="h-4 w-4 fill-current ml-1" />
              </div>
              Lihat Cara Kerja
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 🛠 Features Grid */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: "Paket Eksklusif", 
                desc: "Pilihan menu dari Prasmanan, Nasi Box premium, hingga menu Diet khusus.",
                icon: Package,
                color: "bg-orange-500"
              },
              { 
                title: "Smart Tracking", 
                desc: "Pantau pesanan Anda secara real-time dari dapur ke depan pintu Anda.",
                icon: Truck,
                color: "bg-indigo-500"
              },
              { 
                title: "Quality First", 
                desc: "Bahan organik pilihan yang diolah oleh Chef berpengalaman puluhan tahun.",
                icon: ShoppingCart,
                color: "bg-emerald-500"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
              >
                <div className={cn("h-16 w-16 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-slate-200", f.color)}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 Testimonial & Trust */}
      <section className="py-32 overflow-hidden bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-[0.2em] mb-6">
                <Heart className="h-4 w-4 fill-current" /> Suara Pelanggan
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8 italic">
                &quot;Layanan katering <span className="text-orange-500 underline decoration-slate-200 underline-offset-8">paling praktis</span> yang pernah saya gunakan.&quot;
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-slate-200 overflow-hidden">
                  {/* Avatar Placeholder */}
                  <div className="w-full h-full bg-linear-to-br from-slate-300 to-slate-400" />
                </div>
                <div>
                  <p className="font-black text-lg">Andini Putri</p>
                  <p className="text-sm font-bold text-slate-400">Penyelenggara Event Pernikahan</p>
                </div>
              </div>
            </div>
            
            {/* Visual Stats */}
            <div className="lg:w-1/2 grid grid-cols-2 gap-4 w-full">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-end h-64 shadow-xl">
                <h4 className="text-5xl font-black mb-2 tracking-tighter">50K+</h4>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Porsi Terkirim</p>
              </div>
              <div className="bg-orange-500 rounded-[2rem] p-8 text-white flex flex-col justify-end h-64 shadow-xl shadow-orange-100">
                <h4 className="text-5xl font-black mb-2 tracking-tighter">100%</h4>
                <p className="text-orange-100 font-bold uppercase text-[10px] tracking-widest">Higienitas Terjamin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📩 CTA Section */}
      <section className="container mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />
          
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 relative z-10">
            Siap merayakan <br /> momen istimewa?
          </h2>
          <Button asChild size="lg" className="rounded-2xl h-16 px-12 bg-white text-slate-900 hover:bg-orange-500 hover:text-white font-black transition-all relative z-10 border-none">
            <Link href="/auth/register">Daftar Akun Gratis</Link>
          </Button>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
          © 2026 CateringPro. Crafted with passion for every bite.
        </p>
      </footer>
    </div>
  );
}