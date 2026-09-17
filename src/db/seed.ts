import { db } from "./index";
import { categories, products, users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  await db
    .insert(users)
    .values([
      {
        name: "Admin",
        email: "admin@beautymart.com",
        password: adminPassword,
        phone: "01000000000",
        address: "القاهرة",
        city: "القاهرة",
        businessName: "إدارة بيوتي مارت للجملة",
        taxId: "TAX-12345678",
        isAdmin: true,
      },
      {
        name: "أحمد محمد",
        email: "ahmed@test.com",
        password: customerPassword,
        phone: "01111111111",
        address: "شارع التحرير",
        city: "الجيزة",
        businessName: "صالون ومستحضرات الورد",
        taxId: "CR-98765432",
        isAdmin: false,
      },
    ])
    .onConflictDoNothing();

  // Create categories
  const catData = [
    { name: "Skincare", nameAr: "العناية بالبشرة", slug: "skincare", icon: "🧴" },
    { name: "Makeup", nameAr: "المكياج", slug: "makeup", icon: "💄" },
    { name: "Haircare", nameAr: "العناية بالشعر", slug: "haircare", icon: "💇" },
    { name: "Fragrance", nameAr: "العطور", slug: "fragrance", icon: "🌸" },
    { name: "Body Care", nameAr: "العناية بالجسم", slug: "body-care", icon: "🛁" },
    { name: "Tools", nameAr: "أدوات التجميل", slug: "tools", icon: "🖌️" },
  ];

  const insertedCats = await db
    .insert(categories)
    .values(catData)
    .onConflictDoNothing()
    .returning();

  // Get category IDs
  const allCats = await db.select().from(categories);
  const catMap = Object.fromEntries(allCats.map((c) => [c.slug, c.id]));

  // Create products
  const productData = [
    {
      name: "Vitamin C Brightening Serum",
      nameAr: "سيروم فيتامين سي للإشراق",
      description: "Powerful vitamin C serum for brighter, more radiant skin",
      descriptionAr: "سيروم قوي بفيتامين سي لبشرة أكثر إشراقاً ونضارة. يساعد على توحيد لون البشرة وإزالة البقع الداكنة",
      price: "180.00",
      originalPrice: "250.00",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
      categoryId: catMap["skincare"],
      stock: 150,
      isFeatured: true,
      rating: "4.8",
      reviewCount: 234,
    },
    {
      name: "Hyaluronic Acid Moisturizer",
      nameAr: "مرطب حمض الهيالورونيك",
      description: "Deep hydration moisturizer with hyaluronic acid",
      descriptionAr: "مرطب عميق بحمض الهيالورونيك يمنح بشرتك ترطيب يدوم 24 ساعة. مناسب لجميع أنواع البشرة",
      price: "145.00",
      originalPrice: "200.00",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
      categoryId: catMap["skincare"],
      stock: 200,
      isFeatured: true,
      rating: "4.7",
      reviewCount: 189,
    },
    {
      name: "Retinol Anti-Aging Night Cream",
      nameAr: "كريم ريتينول الليلي لمكافحة الشيخوخة",
      description: "Advanced retinol night cream for anti-aging",
      descriptionAr: "كريم ليلي متقدم بالريتينول لمحاربة علامات الشيخوخة وتجديد خلايا البشرة أثناء النوم",
      price: "220.00",
      originalPrice: "300.00",
      image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop",
      categoryId: catMap["skincare"],
      stock: 85,
      isFeatured: true,
      rating: "4.6",
      reviewCount: 156,
    },
    {
      name: "Matte Liquid Lipstick Set",
      nameAr: "سيت شفاه سائلة مات",
      description: "Long-lasting matte liquid lipstick collection",
      descriptionAr: "مجموعة شفاه سائلة بتركيبة مات تدوم طوال اليوم. تتضمن 6 ألوان عصرية تناسب جميع المناسبات",
      price: "165.00",
      originalPrice: "230.00",
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
      categoryId: catMap["makeup"],
      stock: 300,
      isFeatured: true,
      rating: "4.5",
      reviewCount: 312,
    },
    {
      name: "Professional Eyeshadow Palette",
      nameAr: "باليت ظلال عيون احترافية",
      description: "18-shade professional eyeshadow palette",
      descriptionAr: "باليت ظلال عيون احترافية بـ 18 لون بين المات والشيمير. ألوان عالية الصبغة وسهلة الدمج",
      price: "280.00",
      originalPrice: "380.00",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
      categoryId: catMap["makeup"],
      stock: 120,
      isFeatured: true,
      rating: "4.9",
      reviewCount: 445,
    },
    {
      name: "Full Coverage Foundation",
      nameAr: "كريم أساس تغطية كاملة",
      description: "Full coverage liquid foundation for all skin types",
      descriptionAr: "كريم أساس سائل بتغطية كاملة وتركيبة خفيفة على البشرة. يدوم حتى 12 ساعة بدون لمعان",
      price: "195.00",
      originalPrice: "260.00",
      image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop",
      categoryId: catMap["makeup"],
      stock: 180,
      isFeatured: false,
      rating: "4.4",
      reviewCount: 267,
    },
    {
      name: "Keratin Hair Mask",
      nameAr: "ماسك الكيراتين للشعر",
      description: "Intensive keratin hair treatment mask",
      descriptionAr: "ماسك كيراتين مكثف لإصلاح الشعر التالف وتنعيمه. يعيد الحيوية واللمعان للشعر المعالج",
      price: "135.00",
      originalPrice: "180.00",
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
      categoryId: catMap["haircare"],
      stock: 250,
      isFeatured: true,
      rating: "4.7",
      reviewCount: 198,
    },
    {
      name: "Argan Oil Shampoo",
      nameAr: "شامبو زيت الأرغان",
      description: "Nourishing argan oil shampoo for silky hair",
      descriptionAr: "شامبو غني بزيت الأرغان المغربي لتغذية الشعر العميق وجعله ناعماً كالحرير",
      price: "95.00",
      originalPrice: "130.00",
      image: "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=400&h=400&fit=crop",
      categoryId: catMap["haircare"],
      stock: 300,
      isFeatured: false,
      rating: "4.3",
      reviewCount: 145,
    },
    {
      name: "Rose Oud Perfume",
      nameAr: "عطر روز عود",
      description: "Luxurious rose and oud blend perfume",
      descriptionAr: "عطر فاخر يجمع بين الورد البلدي والعود الطبيعي. رائحة تدوم طوال اليوم تناسب المناسبات الخاصة",
      price: "350.00",
      originalPrice: "500.00",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
      categoryId: catMap["fragrance"],
      stock: 60,
      isFeatured: true,
      rating: "4.9",
      reviewCount: 523,
    },
    {
      name: "French Lavender Mist",
      nameAr: "مسك اللافندر الفرنسي",
      description: "Light and fresh lavender body mist",
      descriptionAr: "بودي ميست خفيف ومنعش برائحة اللافندر الفرنسي. مثالي للاستخدام اليومي في الصيف",
      price: "120.00",
      originalPrice: "160.00",
      image: "https://images.unsplash.com/photo-1594035910387-fbd1a7857d56?w=400&h=400&fit=crop",
      categoryId: catMap["fragrance"],
      stock: 180,
      isFeatured: false,
      rating: "4.5",
      reviewCount: 178,
    },
    {
      name: "Shea Butter Body Lotion",
      nameAr: "لوشن الجسم بزبدة الشيا",
      description: "Rich shea butter body moisturizer",
      descriptionAr: "لوشن غني بزبدة الشيا الطبيعية لترطيب عميق يدوم 48 ساعة. ينعم البشرة الجافة ويمنحها نعومة فائقة",
      price: "110.00",
      originalPrice: "150.00",
      image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop",
      categoryId: catMap["body-care"],
      stock: 220,
      isFeatured: false,
      rating: "4.6",
      reviewCount: 134,
    },
    {
      name: "Coffee Body Scrub",
      nameAr: "سكراب القهوة للجسم",
      description: "Exfoliating coffee body scrub",
      descriptionAr: "سكراب القهوة الطبيعي لإزالة خلايا الجلد الميتة وتنعيم البشرة. يساعد على تقليل السيلوليت وتوحيد لون البشرة",
      price: "85.00",
      originalPrice: "120.00",
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
      categoryId: catMap["body-care"],
      stock: 170,
      isFeatured: true,
      rating: "4.8",
      reviewCount: 289,
    },
    {
      name: "Professional Makeup Brush Set",
      nameAr: "سيت فرش مكياج احترافية",
      description: "12-piece professional makeup brush set",
      descriptionAr: "سيت 12 فرشاة مكياج احترافية بشعيرات صناعية ناعمة. تأتي في علبة أنيقة مناسبة للسفر",
      price: "250.00",
      originalPrice: "350.00",
      image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop",
      categoryId: catMap["tools"],
      stock: 100,
      isFeatured: true,
      rating: "4.7",
      reviewCount: 356,
    },
    {
      name: "LED Makeup Mirror",
      nameAr: "مرآة مكياج بإضاءة LED",
      description: "Hollywood-style LED makeup mirror",
      descriptionAr: "مرآة مكياج بإضاءة LED بـ 3 درجات إضاءة. تدور 360 درجة وتأتي مع قاعدة لتخزين الأدوات",
      price: "320.00",
      originalPrice: "450.00",
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
      categoryId: catMap["tools"],
      stock: 45,
      isFeatured: false,
      rating: "4.8",
      reviewCount: 167,
    },
    {
      name: "Niacinamide Pore Serum",
      nameAr: "سيروم النياسيناميد المسام",
      description: "Pore-minimizing niacinamide serum",
      descriptionAr: "سيروم النياسيناميد لتقليل المسام الواسعة والتحكم في إفراز الدهون. يحسن ملمس البشرة ويمنحها مظهراً ناعماً",
      price: "155.00",
      originalPrice: "210.00",
      image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop",
      categoryId: catMap["skincare"],
      stock: 190,
      isFeatured: false,
      rating: "4.6",
      reviewCount: 201,
    },
    {
      name: "Waterproof Mascara",
      nameAr: "ماسكرا مقاومة للماء",
      description: "Long-lasting waterproof mascara",
      descriptionAr: "ماسكرا مقاومة للماء تمنح رموشك كثافة وطول فائقين. تدوم حتى 24 ساعة بدون تلطيخ",
      price: "75.00",
      originalPrice: "110.00",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop",
      categoryId: catMap["makeup"],
      stock: 350,
      isFeatured: false,
      rating: "4.3",
      reviewCount: 423,
    },
  ];

  const wholesaleProducts = productData.map((p) => {
    const priceNum = parseFloat(p.price);
    return {
      ...p,
      minOrderQuantity: 6,
      packageUnit: "دستة (12 قطعة)",
      piecesPerPackage: 12,
      tier1Min: 12,
      tier1Price: (priceNum * 0.9).toFixed(2),
      tier2Min: 48,
      tier2Price: (priceNum * 0.8).toFixed(2),
    };
  });

  await db.insert(products).values(wholesaleProducts).onConflictDoNothing();

  console.log("✅ Seed complete!");
  console.log("📧 Admin: admin@beautymart.com / admin123");
  console.log("📧 Customer: ahmed@test.com / customer123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
