"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// TOKOH ALKITAB - FAITH ARCHIVES
const daftarTokoh = [
  { id: 1, nama: "DAVID", gelar: "GIANT SLATER", theme: "Faith Over Fear", gambar: "/models/david-giant-slater.png", produkId: 1 },
  { id: 2, nama: "JOSHUA", gelar: "CONQUEROR", theme: "Be Strong And Courageous", gambar: "/models/joshua-conqueror.png", produkId: 2 },
  { id: 3, nama: "MOSES", gelar: "DELIVERER", theme: "Chosen Despite Weakness", gambar: "/models/moses-deliverer.png", produkId: 3 },
  { id: 4, nama: "SAMSON", gelar: "THE STRONGHOLD", theme: "Might For God", gambar: "/models/samson-the-stronghold.png", produkId: 4 },
];

// ESSENTIALS
const daftarEssentialsFoto = [
  { id: 8, nama: "ESSENTIAL BLACK", gambar: "/models/essential-4.png" },
  { id: 5, nama: "ESSENTIAL BLACK", gambar: "/models/essential-1.png" },
  { id: 6, nama: "ESSENTIAL BLACK", gambar: "/models/essential-2.png" },
  { id: 7, nama: "ESSENTIAL BLACK", gambar: "/models/essential-3.png" },
];

// PRODUK FAITH ARCHIVES
const faithArchivesProduk = [
  { id: 1, nama: "DAVID", gelar: "GIANT SLATER", theme: "Faith Over Fear", harga: "IDR 169.000", stok: { S: 0, M: 2, L: 2, XL: 1 }, totalStok: 5, seri: "FAITH ARCHIVES" },
  { id: 2, nama: "JOSHUA", gelar: "CONQUEROR", theme: "Be Strong And Courageous", harga: "IDR 169.000", stok: { S: 1, M: 1, L: 0, XL: 1 }, totalStok: 3, seri: "FAITH ARCHIVES" },
  { id: 3, nama: "MOSES", gelar: "DELIVERER", theme: "Chosen Despite Weakness", harga: "IDR 169.000", stok: { S: 0, M: 2, L: 1, XL: 0 }, totalStok: 3, seri: "FAITH ARCHIVES" },
  { id: 4, nama: "SAMSON", gelar: "THE STRONGHOLD", theme: "Might For God", harga: "IDR 169.000", stok: { S: 0, M: 2, L: 1, XL: 1 }, totalStok: 4, seri: "FAITH ARCHIVES" },
];

// PRODUK ESSENTIALS
const essentialsProduk = {
  id: 5,
  nama: "ESSENTIALS",
  warna: "Black",
  harga: "IDR 139.000",
  stok: { S: 1, M: 3, L: 0, XL: 2 },
  totalStok: 6,
  seri: "ESSENTIALS"
};

const TOTAL_PCS = 21;
const WHATSAPP_NUMBER = "6282197629818";

const sizeChart = {
  S: { lebar: 52, panjang: 70 },
  M: { lebar: 55, panjang: 73 },
  L: { lebar: 58, panjang: 76 },
  XL: { lebar: 61, panjang: 79 },
};

export default function Home() {
  const [kategoriKoleksi, setKategoriKoleksi] = useState("faith");
  const [tokohAktif, setTokohAktif] = useState(daftarTokoh[0]);
  const [essentialsFotoAktif, setEssentialsFotoAktif] = useState(daftarEssentialsFoto[0]);
  const [ukuranAktif, setUkuranAktif] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const produkTerpilih = kategoriKoleksi === "faith" 
    ? faithArchivesProduk.find(p => p.id === tokohAktif.produkId)
    : essentialsProduk;
  
  const stokUkuran = produkTerpilih?.stok || { S: 0, M: 0, L: 0, XL: 0 };
  const ukuranTersedia = ["S", "M", "L", "XL"];

  const handleShopNow = () => {
    if (stokUkuran[ukuranAktif] === 0) {
      setToastMessage("Stok habis, pilih ukuran lain");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const pesan = `ORDER CAVO - DROP 01

${kategoriKoleksi === "faith" 
  ? `${produkTerpilih.nama} - ${tokohAktif.gelar}`
  : `ESSENTIALS - BLACK`}
Ukuran: ${ukuranAktif}
Harga: ${produkTerpilih.harga}

Data Pemesan:
Nama: 
Alamat: 
No. WhatsApp: 

---
Ordinary people. Extraordinary calling.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
    setToastMessage("Dialihkan ke WhatsApp");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const gambarAktif = kategoriKoleksi === "faith" ? tokohAktif.gambar : essentialsFotoAktif.gambar;

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm shadow-lg bg-black text-white"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-5 py-8">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-16 mx-auto mb-3">
            <Image
              src="/models/logo.png"
              alt="CAVO"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-[11px] tracking-[0.25em] text-gray-500 uppercase mb-1">DROP 01 — THE CALLING</div>
          <div className="text-[10px] text-gray-400 italic">Ordinary people. Extraordinary calling.</div>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4" />
        </div>

        {/* BADGE LIMITED */}
        <div className="flex justify-center mb-6">
          <div className="border border-black text-black text-[10px] font-medium px-4 py-1 rounded-full">
            LIMITED TO {TOTAL_PCS} PCS
          </div>
        </div>

        {/* TOMBOL KOLEKSI */}
        <div className="flex justify-center gap-4 mb-7">
          <button
            onClick={() => {
              setKategoriKoleksi("faith");
              setUkuranAktif("M");
            }}
            className={`text-sm font-medium py-1.5 px-5 rounded-full transition ${
              kategoriKoleksi === "faith" 
                ? "bg-black text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            FAITH ARCHIVES
          </button>
          <button
            onClick={() => {
              setKategoriKoleksi("essentials");
              setUkuranAktif("M");
            }}
            className={`text-sm font-medium py-1.5 px-5 rounded-full transition ${
              kategoriKoleksi === "essentials" 
                ? "bg-black text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ESSENTIALS
          </button>
        </div>

        {/* GAMBAR UTAMA */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={kategoriKoleksi === "faith" ? tokohAktif.id : essentialsFotoAktif.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image src={gambarAktif} alt="CAVO" fill className="object-cover" priority />
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {produkTerpilih.totalStok} left
          </div>
        </div>

        {/* THUMBNAIL */}
        <div className="overflow-x-auto no-scrollbar mb-6">
          <div className="flex gap-2 justify-center min-w-max">
            {kategoriKoleksi === "faith" 
              ? daftarTokoh.map((tokoh) => (
                  <button
                    key={tokoh.id}
                    onClick={() => setTokohAktif(tokoh)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${
                      tokohAktif.id === tokoh.id 
                        ? "border-black" 
                        : "border-gray-200"
                    }`}
                  >
                    <Image src={tokoh.gambar} alt={tokoh.nama} fill className="object-cover" />
                  </button>
                ))
              : daftarEssentialsFoto.map((foto) => (
                  <button
                    key={foto.id}
                    onClick={() => setEssentialsFotoAktif(foto)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${
                      essentialsFotoAktif.id === foto.id 
                        ? "border-black" 
                        : "border-gray-200"
                    }`}
                  >
                    <Image src={foto.gambar} alt="Essential" fill className="object-cover" />
                  </button>
                ))
            }
          </div>
        </div>

        {/* INFO PRODUK */}
        <div className="text-center">
          <div className="text-[10px] font-medium text-gray-400 tracking-[0.2em] mb-1">
            {produkTerpilih.seri}
          </div>
          
          {kategoriKoleksi === "faith" ? (
            <>
              <div className="text-4xl font-bold tracking-tight text-black">{produkTerpilih.nama}</div>
              <div className="text-[11px] text-gray-500 mt-1">{tokohAktif.theme}</div>
              <div className="text-xs text-gray-400 uppercase mt-0.5">{tokohAktif.gelar}</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold tracking-tight text-black">ESSENTIALS</div>
              <div className="text-xs text-gray-400 uppercase mt-1">Black Edition</div>
            </>
          )}
          
          <div className="flex justify-center gap-1 my-3">
            <div className="w-6 h-px bg-gray-300" />
            <div className="w-8 h-px bg-gray-400" />
            <div className="w-6 h-px bg-gray-300" />
          </div>
          
          <div className="text-2xl font-bold text-black">{produkTerpilih.harga}</div>
          
          <div className="text-[10px] text-gray-400 mt-3">
            Cotton Australia 250 Coolbreeze · 250 GSM · Oversized fit
          </div>
        </div>

        {/* SIZE SELECTION */}
        <div className="mt-7">
          <div className="text-center text-[10px] font-medium text-gray-400 tracking-[0.2em] mb-2">
            SIZE
          </div>
          <div className="flex justify-center gap-2">
            {ukuranTersedia.map((ukuran) => {
              const stok = stokUkuran[ukuran];
              const isTersedia = stok > 0;
              return (
                <button
                  key={ukuran}
                  onClick={() => isTersedia && setUkuranAktif(ukuran)}
                  className={`w-11 py-1.5 text-sm font-medium rounded-md border transition ${
                    ukuranAktif === ukuran && isTersedia 
                      ? "border-black bg-black text-white" 
                      : isTersedia 
                        ? "border-gray-300 text-black hover:border-black" 
                        : "border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {ukuran}
                </button>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-3 mt-2">
            {ukuranTersedia.map((ukuran) => {
              const stok = stokUkuran[ukuran];
              if (stok > 0) {
                return <span key={ukuran} className="text-[9px] text-gray-400">{ukuran}: {stok}</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setShowSizeChart(!showSizeChart)}
            className="w-full mt-2 text-[9px] text-gray-400 underline text-center"
          >
            Size guide
          </button>

          {showSizeChart && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-[9px] font-medium text-center text-black mb-2">Size chart (cm)</div>
              <div className="flex justify-center gap-5 text-[8px] text-gray-600">
                <div><span className="block font-medium text-black">S</span>52/70</div>
                <div><span className="block font-medium text-black">M</span>55/73</div>
                <div><span className="block font-medium text-black">L</span>58/76</div>
                <div><span className="block font-medium text-black">XL</span>61/79</div>
              </div>
            </div>
          )}
        </div>

        {/* TOMBOL ORDER */}
        <button
          onClick={handleShopNow}
          disabled={stokUkuran[ukuranAktif] === 0}
          className={`w-full mt-7 py-3 text-sm font-medium tracking-[0.2em] rounded-full transition ${
            stokUkuran[ukuranAktif] > 0 
              ? "bg-black text-white hover:bg-gray-800" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {stokUkuran[ukuranAktif] === 0 ? "SOLD OUT" : "ORDER VIA WHATSAPP"}
        </button>

        {/* FOOTER */}
        <div className="text-center mt-7 pt-4 border-t border-gray-100">
          <div className="text-[9px] text-gray-400 tracking-[0.15em]">CAVO — FAITH ARCHIVES</div>
          <div className="text-[8px] text-gray-300 mt-1">DROP 01 · THE CALLING</div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}