import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
const prisma = new PrismaClient();

async function main() {
  // categories - Danh mục sách cybersecurity
  const cats = [
    { name: 'Cryptography', slug: 'cryptography' },
    { name: 'Forensics', slug: 'forensics' },
    { name: 'Malware Analysis', slug: 'malware-analysis' },
    { name: 'Networking', slug: 'networking' },
    { name: 'Pwnable', slug: 'pwnable' },
    { name: 'Reverse Engineering', slug: 'reverse-engineering' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // Xóa các danh mục không cần thiết
  await prisma.category.deleteMany({
    where: {
      slug: {
        in: ['security', 'web-security', 'network-security', 'programming']
      }
    }
  });

  // products - Giá VND
  const products = [
    {
      slug: 'an-introduction-to-mathematical-cryptography',
      name: 'An Introduction to Mathematical Cryptography',
      description: 'A comprehensive introduction to modern cryptography, covering the mathematics behind cryptographic protocols and algorithms.',
      price: 450000,
      salePrice: null,
      brand: 'Springer',
      stock: 50,
      categorySlug: 'cryptography',
      images: ['/images/crypto.jpg'],
    },
    {
      slug: 'the-art-of-deception',
      name: 'The Art of Deception',
      description: 'Kevin Mitnick on social engineering and the human element in security.',
      price: 380000,
      salePrice: 320000,
      brand: 'Wiley',
      stock: 40,
      categorySlug: 'web-security',
      images: ['/images/deception.jpg'],
    },
    {
      slug: 'tcp-ip-illustrated-vol-1',
      name: 'TCP/IP Illustrated, Volume 1',
      description: 'A detailed guide to TCP/IP networking protocols.',
      price: 520000,
      salePrice: null,
      brand: 'Addison-Wesley',
      stock: 30,
      categorySlug: 'network-security',
      images: ['/images/tcp.jpg'],
    },
    {
      slug: 'practical-reverse-engineering',
      name: 'Practical Reverse Engineering',
      description: 'x86, x64, ARM, Windows Kernel, Reversing Tools, and Obfuscation.',
      price: 680000,
      salePrice: 580000,
      brand: 'Wiley',
      stock: 25,
      categorySlug: 'reverse-engineering',
      images: ['/images/reverse.jpg'],
    },
    {
      slug: 'hacking-the-art-of-exploitation',
      name: 'Hacking: The Art of Exploitation',
      description: 'A comprehensive guide to programming-based exploitation and security.',
      price: 420000,
      salePrice: null,
      brand: 'No Starch Press',
      stock: 35,
      categorySlug: 'pwnable',
      images: ['/images/hacking.jpg'],
    },
    {
      slug: 'the-art-of-memory-forensics',
      name: 'The Art of Memory Forensics',
      description: 'Detecting Malware and Threats in Windows, Linux, and Mac Memory.',
      price: 750000,
      salePrice: 650000,
      brand: 'Wiley',
      stock: 20,
      categorySlug: 'forensics',
      images: ['/images/forensics.jpg'],
    },
    {
      slug: 'practical-malware-analysis',
      name: 'Practical Malware Analysis',
      description: 'The Hands-On Guide to Dissecting Malicious Software.',
      price: 590000,
      salePrice: null,
      brand: 'No Starch Press',
      stock: 28,
      categorySlug: 'malware-analysis',
      images: ['/images/malware.jpg'],
    },
    {
      slug: 'the-web-application-hackers-handbook',
      name: "The Web Application Hacker's Handbook",
      description: 'Finding and Exploiting Security Flaws.',
      price: 480000,
      salePrice: 420000,
      brand: 'Wiley',
      stock: 45,
      categorySlug: 'web-security',
      images: ['/images/webapp.jpg'],
    },
  ];

  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!cat) continue;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        brand: p.brand,
        stock: p.stock,
        categoryId: cat.id,
      },
    });
    for (const url of p.images) {
      await prisma.productImage.upsert({
        where: { id: created.id + ':' + url },
        update: {},
        create: { id: created.id + ':' + url, url, productId: created.id },
      });
    }
  }

  // admin user demo
  const adminPassword = process.env.ADMIN_PASSWORD || 'Test.123';
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash: hashPassword(adminPassword),
      role: 'ADMIN',
    },
  });

  // Sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Giảm 10% cho khách hàng mới',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 100000,
      maxDiscount: 50000,
      isActive: true,
    },
    {
      code: 'SALE50K',
      description: 'Giảm 50.000đ cho đơn từ 300.000đ',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 300000,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      description: 'Giảm 30.000đ phí vận chuyển',
      discountType: 'fixed',
      discountValue: 30000,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  console.log('Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
