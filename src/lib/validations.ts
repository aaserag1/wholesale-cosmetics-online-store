import { z } from "zod";

export const MIN_ORDER_VALUE = 1000; // الحد الأدنى لإجمالي الطلب بالجملة 1,000 ج.م

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور لازم 6 أحرف على الأقل"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const orderSchema = z.object({
  shippingAddress: z.string().min(5, "عنوان الشحن مطلوب"),
  shippingCity: z.string().optional(),
  shippingPhone: z.string().optional(),
  businessName: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج بالإنجليزية مطلوب"),
  nameAr: z.string().min(1, "اسم المنتج بالعربية مطلوب"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  minOrderQuantity: z.coerce.number().min(1, "أقل كمية للطلب يجب أن تكون 1 على الأقل").default(6),
  packageUnit: z.string().default("دستة (12 قطعة)"),
  piecesPerPackage: z.coerce.number().min(1).default(12),
  tier1Min: z.coerce.number().min(1).optional().nullable(),
  tier1Price: z.coerce.number().positive().optional().nullable(),
  tier2Min: z.coerce.number().min(1).optional().nullable(),
  tier2Price: z.coerce.number().positive().optional().nullable(),
  image: z.string().optional().nullable(),
  categoryId: z.coerce.number().positive("يرجى اختيار القسم"),
  stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالباً").default(0),
  isFeatured: z.boolean().optional().default(false),
});
