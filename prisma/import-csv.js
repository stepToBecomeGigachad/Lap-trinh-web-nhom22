import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
    console.log('Starting import from CSV...');

    // Read and parse CSV (file is in prisma folder)
    const csvPath = join(__dirname, 'book_title.csv');
    let csvContent = readFileSync(csvPath, 'utf-8');
    // Remove BOM if present
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }
    // Also try to remove UTF-8 BOM bytes
    csvContent = csvContent.replace(/^\uFEFF/, '');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,  // Handle BOM automatically
    });

    console.log(`Found ${records.length} products in CSV`);

    // Get unique categories from CSV
    const categorySet = new Set(records.map(r => r.categorySlug).filter(Boolean));
    const categoryNames = {
        'forensics': 'Forensics',
        'networking': 'Networking',
        'pwnable': 'Pwnable',
        'malware-analysis': 'Malware Analysis',
        'reverse-engineering': 'Reverse Engineering',
        'cryptography': 'Cryptography',
    };

    // Create categories
    console.log('Creating categories...');
    for (const slug of categorySet) {
        await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { slug, name: categoryNames[slug] || slug },
        });
    }

    // Get category IDs
    const cats = await prisma.category.findMany();
    const catIdBySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    // Delete old products (this will also delete related images due to cascade)
    console.log('Clearing old products...');
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});

    // Import products
    console.log('Importing products...');
    let imported = 0;
    for (const row of records) {
        if (!row.slug || !row.name || !row.price || !row.categorySlug) {
            console.log(`Skipping invalid row: ${row.slug || 'no slug'}`);
            continue;
        }

        const categoryId = catIdBySlug[row.categorySlug];
        if (!categoryId) {
            console.log(`Category not found for: ${row.slug} (${row.categorySlug})`);
            continue;
        }

        try {
            await prisma.product.create({
                data: {
                    slug: row.slug,
                    name: row.name,
                    description: row.description || '',
                    price: parseFloat(row.price) || 0,
                    salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
                    brand: row.brand || null,
                    stock: parseInt(row.stock) || 0,
                    categoryId,
                    images: row.images ? {
                        create: [{ url: row.images }]
                    } : undefined,
                },
            });
            imported++;
        } catch (err) {
            console.error(`Error importing ${row.slug}:`, err.message);
        }
    }

    // Create admin user
    console.log('Creating admin user...');
    await prisma.user.upsert({
        where: { email: 'admin@bookstore.com' },
        update: { role: 'ADMIN' },
        create: {
            name: 'Admin',
            email: 'admin@bookstore.com',
            passwordHash: '$2b$10$8K1p/a0dL1LXMw.Yx0r8E.XK8IYzG4V0e4K/3zK8k8K8K8K8K8K8K', // placeholder
            role: 'ADMIN',
        },
    });

    // Create sample coupons
    console.log('Creating sample coupons...');
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
    ];

    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c,
        });
    }

    console.log(`\n✅ Import completed!`);
    console.log(`   - ${imported} products imported`);
    console.log(`   - ${categorySet.size} categories created`);
    console.log(`   - Admin user created`);
    console.log(`   - Sample coupons created`);
}

main()
    .catch((e) => {
        console.error('Import failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
