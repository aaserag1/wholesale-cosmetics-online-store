"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  descriptionAr: string | null;
  price: string;
  originalPrice: string | null;
  image: string | null;
  stock: number;
  minOrderQuantity?: number;
  packageUnit?: string;
  piecesPerPackage?: number;
  tier1Min?: number | null;
  tier1Price?: string | null;
  tier2Min?: number | null;
  tier2Price?: string | null;
  rating: string | null;
  reviewCount: number;
  categoryName: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const moq = product.minOrderQuantity || 6;

  const discount = product.originalPrice
    ? Math.round(
        ((parseFloat(product.originalPrice) - parseFloat(product.price)) /
          parseFloat(product.originalPrice)) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, moq, {
      id: product.id,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      stock: product.stock,
      minOrderQuantity: product.minOrderQuantity,
      packageUnit: product.packageUnit,
      piecesPerPackage: product.piecesPerPackage,
      tier1Min: product.tier1Min,
      tier1Price: product.tier1Price,
      tier2Min: product.tier2Min,
      tier2Price: product.tier2Price,
    });
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between">
      {/* Image & Badges */}
      <div>
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.nameAr}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🧴
              </div>
            )}
          </div>
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={inWishlist ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-sm"
          >
            {inWishlist ? "❤️" : "🤍"}
          </button>

          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {discount}%-
            </span>
          )}
          {product.packageUnit && (
            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-lg">
              📦 {product.packageUnit}
            </span>
          )}
          {product.stock <= 20 && product.stock > 0 && (
            <span className="absolute top-12 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              باقي {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full">
                نفد من المخزن
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            {product.categoryName && (
              <span className="text-xs text-secondary font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                {product.categoryName}
              </span>
            )}
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              أقل طلب: {moq} ق
            </span>
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-gray-800 mt-2 line-clamp-2 hover:text-primary transition-colors text-sm md:text-base">
              {product.nameAr}
            </h3>
          </Link>

          {product.descriptionAr && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
              {product.descriptionAr}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex text-amber-400 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < Math.round(parseFloat(product.rating || "0")) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-primary">
                {parseFloat(product.price).toFixed(0)} ج.م
              </span>
              <span className="text-xs text-gray-500">/ قطعة</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {parseFloat(product.originalPrice).toFixed(0)} ج.م
                </span>
              )}
            </div>
            {product.tier1Price && (
              <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                🏷️ يبدأ من {parseFloat(product.tier1Price).toFixed(0)} ج.م عند طلب {product.tier1Min || 12}+ قطعة
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
            justAdded
              ? "bg-green-600 text-white shadow-md shadow-green-200"
              : "bg-gradient-to-l from-primary to-secondary text-white hover:shadow-lg hover:shadow-pink-200"
          }`}
        >
          {adding
            ? "جاري الإضافة..."
            : justAdded
            ? `✅ أضيفت (${moq} قطع)`
            : product.stock === 0
            ? "نفد"
            : `🛒 أضف (${moq} قطع)`}
        </button>
      </div>
    </div>
  );
}
