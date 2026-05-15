"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const WHATSAPP_NUMBER = "6282197629818";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const sizeChart = {
  S: { lebar: 52, panjang: 70 },
  M: { lebar: 55, panjang: 73 },
  L: { lebar: 58, panjang: 76 },
  XL: { lebar: 61, panjang: 79 },
};

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [essentialImages, setEssentialImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategoriKoleksi, setKategoriKoleksi] = useState("faith");
  const [tokohAktif, setTokohAktif] = useState(null);
  const [essentialsFotoAktif, setEssentialsFotoAktif] = useState(null); // 👈 TAMBAHKAN
  const [ukuranAktif, setUkuranAktif] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [totalPcs, setTotalPcs] = useState(0);

  // Fetch products dari backend
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil produk");
        return res.json();
      })
      .then((data) => {
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);

        const faithProducts = productsArray.filter(
          (p) => p.category === "FAITH ARCHIVES",
        );
        if (faithProducts.length > 0) {
          setTokohAktif(faithProducts[0]);
        }

        const total = productsArray.reduce(
          (sum, product) => sum + (product.total_stok || 0),
          0,
        );
        setTotalPcs(total);
      })
      .catch((err) => {
        console.error("Error Products:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch essential images dari backend
    fetch(`${API_URL}/essential-images`)
      .then((res) => {
        if (!res.ok) throw new Error("Endpoint not found");
        return res.json();
      })
      .then((data) => {
        const imagesArray = Array.isArray(data) ? data : [];
        setEssentialImages(imagesArray);
        if (imagesArray.length > 0) {
          setEssentialsFotoAktif(imagesArray[0]); // 👈 Set default gambar pertama
        }
      })
      .catch(() => {
        const fallback = [
          { id: 1, gambar: "/models/essential-1.png" },
          { id: 2, gambar: "/models/essential-2.png" },
          { id: 3, gambar: "/models/essential-3.png" },
          { id: 4, gambar: "/models/essential-4.png" },
        ];
        setEssentialImages(fallback);
        setEssentialsFotoAktif(fallback[0]);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const faithArchives = products.filter((p) => p.category === "FAITH ARCHIVES");
  const essentials = products.find((p) => p.category === "ESSENTIALS");
  const essentialsFoto =
    essentialImages.length > 0
      ? essentialImages
      : [
          { id: 1, gambar: "/models/essential-1.png" },
          { id: 2, gambar: "/models/essential-2.png" },
          { id: 3, gambar: "/models/essential-3.png" },
          { id: 4, gambar: "/models/essential-4.png" },
        ];

  // 👈 Gambar utama berdasarkan kategori
  const gambarUtama =
    kategoriKoleksi === "faith"
      ? tokohAktif?.image_url
      : essentialsFotoAktif?.gambar;

  const produkTerpilih = kategoriKoleksi === "faith" ? tokohAktif : essentials;
  const stokUkuran = produkTerpilih
    ? {
        S: produkTerpilih.stock_s || 0,
        M: produkTerpilih.stock_m || 0,
        L: produkTerpilih.stock_l || 0,
        XL: produkTerpilih.stock_xl || 0,
      }
    : { S: 0, M: 0, L: 0, XL: 0 };
  const ukuranTersedia = ["S", "M", "L", "XL"];

  const handleShopNow = () => {
    if (stokUkuran[ukuranAktif] === 0) {
      setToastMessage("Stok habis, pilih ukuran lain");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const pesan = `ORDER CAVO - DROP 01

${
  kategoriKoleksi === "faith"
    ? `${produkTerpilih.name} - ${produkTerpilih.gelar}`
    : `ESSENTIALS - BLACK`
}
Ukuran: ${ukuranAktif}
Harga: IDR ${produkTerpilih.price.toLocaleString("id-ID")}

Data Pemesan:
Nama: 
Alamat: 
No. WhatsApp: 

---
Ordinary people. Extraordinary calling.`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`,
      "_blank",
    );
    setToastMessage("Dialihkan ke WhatsApp");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
          <div className="text-[11px] tracking-[0.25em] text-gray-500 uppercase mb-1">
            DROP 01 — THE CALLING
          </div>
          <div className="text-[10px] text-gray-400 italic">
            Minimal Form. Maximum Presence.{" "}
          </div>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4" />
        </div>

        {/* BADGE LIMITED */}
        <div className="flex justify-center mb-6">
          <div className="border border-black text-black text-[10px] font-medium px-4 py-1 rounded-full">
            LIMITED TO {totalPcs} PCS
          </div>
        </div>

        {/* TOMBOL KOLEKSI */}
        <div className="flex justify-center gap-4 mb-7">
          <button
            onClick={() => {
              setKategoriKoleksi("faith");
              if (faithArchives.length > 0) setTokohAktif(faithArchives[0]);
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
              key={
                kategoriKoleksi === "faith"
                  ? tokohAktif?.id
                  : essentialsFotoAktif?.id
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={gambarUtama || "/models/essential-1.png"}
                alt={produkTerpilih?.name || "CAVO"}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {produkTerpilih?.total_stok} left
          </div>
        </div>

        {/* THUMBNAIL - FAITH ARCHIVES */}
        {kategoriKoleksi === "faith" && (
          <div className="overflow-x-auto no-scrollbar mb-6">
            <div className="flex gap-2 justify-center min-w-max">
              {faithArchives.map((tokoh) => (
                <button
                  key={tokoh.id}
                  onClick={() => setTokohAktif(tokoh)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${
                    tokohAktif?.id === tokoh.id
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={tokoh.image_url}
                    alt={tokoh.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THUMBNAIL - ESSENTIALS - dengan onClick */}
        {kategoriKoleksi === "essentials" && (
          <div className="overflow-x-auto no-scrollbar mb-6">
            <div className="flex gap-2 justify-center min-w-max">
              {essentialsFoto.map((foto) => (
                <button
                  key={foto.id}
                  onClick={() => setEssentialsFotoAktif(foto)} // 👈 TAMBAHKAN onClick
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${
                    essentialsFotoAktif?.id === foto.id
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={foto.gambar}
                    alt="Essential"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INFO PRODUK */}
        <div className="text-center">
          <div className="text-[10px] font-medium text-gray-400 tracking-[0.2em] mb-1">
            {kategoriKoleksi === "faith" ? "FAITH ARCHIVES" : "ESSENTIALS"}
          </div>

          {kategoriKoleksi === "faith" ? (
            <>
              <div className="text-4xl font-bold tracking-tight text-black">
                {produkTerpilih?.name}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {produkTerpilih?.theme}
              </div>
              <div className="text-xs text-gray-400 uppercase mt-0.5">
                {produkTerpilih?.gelar}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold tracking-tight text-black">
                ESSENTIALS
              </div>
              <div className="text-xs text-gray-400 uppercase mt-1">
                Black Edition
              </div>
            </>
          )}

          <div className="flex justify-center gap-1 my-3">
            <div className="w-6 h-px bg-gray-300" />
            <div className="w-8 h-px bg-gray-400" />
            <div className="w-6 h-px bg-gray-300" />
          </div>

          <div className="text-2xl font-bold text-black">
            IDR {produkTerpilih?.price?.toLocaleString("id-ID")}
          </div>

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
                return (
                  <span key={ukuran} className="text-[9px] text-gray-400">
                    {ukuran}: {stok}
                  </span>
                );
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
              <div className="text-[9px] font-medium text-center text-black mb-2">
                Size chart (cm)
              </div>
              <div className="flex justify-center gap-5 text-[8px] text-gray-600">
                <div>
                  <span className="block font-medium text-black">S</span>52/70
                </div>
                <div>
                  <span className="block font-medium text-black">M</span>55/73
                </div>
                <div>
                  <span className="block font-medium text-black">L</span>58/76
                </div>
                <div>
                  <span className="block font-medium text-black">XL</span>61/79
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (stokUkuran[ukuranAktif] > 0) {
              router.push(
                `/checkout?product=${encodeURIComponent(produkTerpilih.name)}&size=${ukuranAktif}&price=${produkTerpilih.price}&image=${produkTerpilih.image_url}&gelar=${encodeURIComponent(produkTerpilih.gelar || "")}`,
              );
            }
          }}
          disabled={stokUkuran[ukuranAktif] === 0}
          className={`w-full mt-7 py-3 text-sm font-medium tracking-[0.2em] rounded-full transition ${
            stokUkuran[ukuranAktif] > 0
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {stokUkuran[ukuranAktif] === 0 ? "SOLD OUT" : "BELI SEKARANG"}
        </button>

        {/* FOOTER */}
        <div className="text-center mt-7 pt-4 border-t border-gray-100">
          <div className="text-[9px] text-gray-400 tracking-[0.15em]">
            CAVO — FAITH ARCHIVES
          </div>
          <div className="text-[8px] text-gray-300 mt-1">
            DROP 01 · THE CALLING
          </div>
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
