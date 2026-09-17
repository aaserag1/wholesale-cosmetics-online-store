import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// ── Users ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  businessName: varchar("business_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 100 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Verification Codes ─────────────────────────────────
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Categories ─────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 10 }).default("✨"),
});

// ── Products ───────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  minOrderQuantity: integer("min_order_quantity").default(6).notNull(),
  packageUnit: varchar("package_unit", { length: 50 }).default("دستة (12 قطعة)").notNull(),
  piecesPerPackage: integer("pieces_per_package").default(12).notNull(),
  tier1Min: integer("tier1_min").default(12),
  tier1Price: decimal("tier1_price", { precision: 10, scale: 2 }),
  tier2Min: integer("tier2_min").default(48),
  tier2Price: decimal("tier2_price", { precision: 10, scale: 2 }),
  image: text("image"),
  categoryId: integer("category_id").references(() => categories.id),
  stock: integer("stock").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Cart Items ─────────────────────────────────────────
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Orders ─────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingPhone: varchar("shipping_phone", { length: 30 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Order Items ────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

// ── Site Settings ──────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("BeautyMart").notNull(),
  siteNameAr: varchar("site_name_ar", { length: 255 }).default("بيوتي مارت").notNull(),
  tagline: varchar("tagline", { length: 255 }).default("المنصة الأولى لتوريد مستحضرات التجميل بالجملة"),
  contactPhone: varchar("contact_phone", { length: 50 }).default("01000000000").notNull(),
  contactWhatsapp: varchar("contact_whatsapp", { length: 50 }).default("201000000000").notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).default("info@beautymart.com").notNull(),
  address: text("address").default("القاهرة، جمهورية مصر العربية"),
  announcementText: text("announcement_text").default("🔥 خصم 10% على جميع طلبيات الجملة التي تتجاوز 10,000 ج.م | شحن لجميع المحافظات"),
  announcementEnabled: boolean("announcement_enabled").default(true).notNull(),
  minOrderTotal: decimal("min_order_total", { precision: 10, scale: 2 }).default("500.00").notNull(),
  facebookUrl: varchar("facebook_url", { length: 255 }).default(""),
  instagramUrl: varchar("instagram_url", { length: 255 }).default(""),
  tiktokUrl: varchar("tiktok_url", { length: 255 }).default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
