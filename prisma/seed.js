import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // categories
  const cats = [
    { name: 'Security', slug: 'security' },
    { name: 'Networking', slug: 'networking' },
    { name: 'Programming', slug: 'programming' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // products
  const products = [
    {
      slug: 'an-introduction-to-mathematical-cryptography',
      name: 'An Introduction to Mathematical Cryptography',
      description: 'A comprehensive introduction to modern cryptography, covering the mathematics behind cryptographic protocols and algorithms.',
      price: 18.5,
      salePrice: null,
      brand: 'Springer',
      stock: 50,
      categorySlug: 'security',
      images: ['/images/crypto.jpg'],
    },
    {
      slug: 'the-art-of-deception',
      name: 'The Art of Deception',
      description: 'Kevin Mitnick on social engineering and the human element in security.',
      price: 20,
      salePrice: 17.5,
      brand: 'Wiley',
      stock: 40,
      categorySlug: 'security',
      images: ['/images/deception.jpg'],
    },
    {
      slug: 'tcp-ip-illustrated-vol-1',
      name: 'TCP/IP Illustrated, Volume 1',
      description: 'A detailed guide to TCP/IP networking protocols.',
      price: 14,
      salePrice: null,
      brand: 'Addison-Wesley',
      stock: 30,
      categorySlug: 'networking',
      images: ['/images/tcp.jpg'],
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
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash: '$2a$10$1m19O6Tz0oU.ycEmIvTN3u3xZt9cP2reE6Qv0d0o7kRk1lGbkVw9y', // bcrypt for 'test.123' (placeholder)
      role: 'ADMIN',
    },
  });

  console.log('Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

