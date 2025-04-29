// This script initializes the MongoDB Atlas database with sample data
// Run it with: node scripts/init-mongodb.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function initDatabase() {
    console.log('Initializing MongoDB Atlas database...');

    try {
        // Create admin user if it doesn't exist
        const existingAdmin = await prisma.user.findFirst({
            where: {
                email: 'admin@example.com',
                role: 'admin'
            }
        });

        if (!existingAdmin) {
            console.log('Creating admin user...');
            await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    password: await bcrypt.hash('admin123', 10),
                    role: 'admin'
                }
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Create sample categories if they don't exist
        const existingCategories = await prisma.category.findMany();

        if (existingCategories.length === 0) {
            console.log('Creating sample categories...');

            const categories = [
                { name: 'Laptops' },
                { name: 'Smartphones' },
                { name: 'Headphones' },
                { name: 'Cameras' },
                { name: 'Accessories' }
            ];

            for (const category of categories) {
                await prisma.category.create({
                    data: category
                });
            }

            console.log('Sample categories created successfully');
        } else {
            console.log(`${existingCategories.length} categories already exist`);
        }

        // Get the categories to use for product creation
        const dbCategories = await prisma.category.findMany();

        // Create sample products if they don't exist
        const existingProducts = await prisma.product.findMany();

        if (existingProducts.length === 0 && dbCategories.length > 0) {
            console.log('Creating sample products...');

            // Sample products for each category
            const laptopCategory = dbCategories.find(c => c.name === 'Laptops');
            const smartphoneCategory = dbCategories.find(c => c.name === 'Smartphones');
            const headphonesCategory = dbCategories.find(c => c.name === 'Headphones');

            if (laptopCategory) {
                await prisma.product.create({
                    data: {
                        slug: 'ultrabook-pro-x1',
                        title: 'UltraBook Pro X1',
                        mainImage: '/laptop 1.png',
                        price: 1299,
                        rating: 4,
                        description: 'High-performance laptop for professionals. Features the latest processors and long battery life.',
                        manufacturer: 'TechCorp',
                        inStock: 15,
                        categoryId: laptopCategory.id
                    }
                });
            }

            if (smartphoneCategory) {
                await prisma.product.create({
                    data: {
                        slug: 'galaxy-ultra-phone',
                        title: 'Galaxy Ultra Phone',
                        mainImage: '/pc 1.png',
                        price: 999,
                        rating: 5,
                        description: 'Next-generation smartphone with amazing camera and performance.',
                        manufacturer: 'Samsung',
                        inStock: 8,
                        categoryId: smartphoneCategory.id
                    }
                });
            }

            if (headphonesCategory) {
                await prisma.product.create({
                    data: {
                        slug: 'noise-cancelling-headphones',
                        title: 'Noise Cancelling Headphones',
                        mainImage: '/headphones 1.png',
                        price: 299,
                        rating: 5,
                        description: 'Premium wireless headphones with active noise cancellation.',
                        manufacturer: 'AudioTech',
                        inStock: 23,
                        categoryId: headphonesCategory.id
                    }
                });
            }

            console.log('Sample products created successfully');
        } else {
            console.log(`${existingProducts.length} products already exist`);
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

initDatabase();