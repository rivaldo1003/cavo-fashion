"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductTabProps {
  products: any[];
  updateStock: (
    id: number,
    s: number,
    m: number,
    l: number,
    xl: number,
  ) => Promise<void>;
  updateProductDetails: (id: number, form: any) => Promise<void>;
  uploadImage: (id: number, file: File) => Promise<void>;
}

export default function ProductTab({
  products,
  updateStock,
  updateProductDetails,
  uploadImage,
}: ProductTabProps) {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    gelar: "",
    theme: "",
    price: 0,
  });

  const faithArchives = products.filter((p) => p.category === "FAITH ARCHIVES");
  const essentials = products.find((p) => p.category === "ESSENTIALS");

  return (
    <>
      {/* Modal Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-black mb-4">
              Edit {editingProduct.name}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Nama"
              />
              <input
                type="text"
                value={editForm.gelar}
                onChange={(e) =>
                  setEditForm({ ...editForm, gelar: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Gelar"
              />
              <input
                type="text"
                value={editForm.theme}
                onChange={(e) =>
                  setEditForm({ ...editForm, theme: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Theme"
              />
              <input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Harga"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={async () => {
                    await updateProductDetails(editingProduct.id, editForm);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 text-black py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Image */}
      {uploadingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-black mb-4">Upload Foto</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadImage(uploadingImage.id, e.target.files[0]);
                  setUploadingImage(null);
                }
              }}
              className="w-full text-black text-sm"
            />
            <button
              onClick={() => setUploadingImage(null)}
              className="w-full mt-4 bg-gray-100 text-black py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAITH ARCHIVES SECTION */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-black mb-3">Faith Archives</h2>
        <div className="space-y-3">
          {faithArchives.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setEditForm({
                  name: product.name,
                  gelar: product.gelar || "",
                  theme: product.theme || "",
                  price: product.price,
                });
              }}
              onUpload={() => setUploadingImage(product)}
              updateStock={updateStock}
            />
          ))}
        </div>
      </div>

      {/* ESSENTIALS SECTION */}
      {essentials && (
        <div>
          <h2 className="text-base font-bold text-black mb-3">Essentials</h2>
          <ProductCard
            product={essentials}
            onEdit={() => {
              setEditingProduct(essentials);
              setEditForm({
                name: essentials.name,
                gelar: essentials.gelar || "",
                theme: essentials.theme || "",
                price: essentials.price,
              });
            }}
            onUpload={() => setUploadingImage(essentials)}
            updateStock={updateStock}
          />
        </div>
      )}
    </>
  );
}

function ProductCard({ product, onEdit, onUpload, updateStock }: any) {
  return (
    <div className="border border-gray-100 rounded p-4">
      <div className="flex gap-4">
        <div className="relative w-14 h-14 bg-gray-50 rounded overflow-hidden flex-shrink-0">
          <Image
            src={product.image_url || "/models/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-black">{product.name}</h3>
              <p className="text-xs text-gray-500">
                {product.gelar || "Black Edition"}
              </p>
              <p className="text-sm font-medium text-black mt-1">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-2">
                Total: {product.total_stok} pcs
              </div>
              <button
                onClick={onEdit}
                className="text-xs bg-gray-100 text-black px-3 py-1 rounded mr-2 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={onUpload}
                className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Stock Inputs */}
          <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-50">
            {["S", "M", "L", "XL"].map((size) => {
              const stockKey = `stock_${size.toLowerCase()}`;
              return (
                <div key={size}>
                  <label className="text-xs text-gray-500 block mb-1">
                    {size}
                  </label>
                  <input
                    type="number"
                    defaultValue={product[stockKey] || 0}
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      if (newStock !== product[stockKey]) {
                        updateStock(
                          product.id,
                          size === "S" ? newStock : product.stock_s,
                          size === "M" ? newStock : product.stock_m,
                          size === "L" ? newStock : product.stock_l,
                          size === "XL" ? newStock : product.stock_xl,
                        );
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-black"
                    min="0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
