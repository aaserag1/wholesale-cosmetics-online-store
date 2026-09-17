"use client";

import { useState, useEffect } from "react";
import { useWishlist } from "@/components/WishlistContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  descriptionAr: string | null;
  price: string;
  originalPrice: string | null;
  image: string | null;
  stock: number;
  rating: string | null;
  reviewCount: number;
  categoryName: string | null;
  minOrderQuantity?: number;
  packageUnit?: string;
  tier1Price?: string | null;
  tier1Min?: number | null;
}

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) {
          const filtered = d.products.filter((p: Product) => wishlistIds.includes(p.id));
          setProducts(filtered);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <span>❤️</span> قائمة المفضلة والطلبات المتكررة
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            المنتجات المحفوظة لصالونك أو متجرك لتسهيل إعادة طلب كميات الجملة بنقرة واحدة
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-sm"
        >
          <span>🛍️</span> تصفح المزيد من منتجات الجملة
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin text-5xl mb-4">🌸</div>
          <p className="text-gray-500">جاري تحميل قائمتك المفضلة...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
          <span className="text-7xl block mb-4">🤍</span>
          <h2 className="text-2xl font-black text-gray-800 mb-2">قائمة المفضلة فارغة حالياً</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            اضغط على علامة القلب في أي منتج لإضافته إلى قائمتك هنا، وتسهيل تكرار الطلب لصالونك بأسعار الجملة.
          </p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-l from-primary to-secondary text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-pink-200 transition-all active:scale-95"
          >
            تصفح كتالوج الجملة الآن 📦
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
