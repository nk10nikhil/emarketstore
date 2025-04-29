// Migration script for transferring data from MySQL to MongoDB Atlas
const { PrismaClient: MySQLPrisma } = require('@prisma/client');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create a new .env.mysql file with your old MySQL connection string before running this script
require('dotenv').config({ path: '.env.mysql' });

// Initialize MySQL Prisma client
const mysqlPrisma = new MySQLPrisma({
    datasources: {
        db: {
            url: process.env.MYSQL_DATABASE_URL,
        },
    },
});

// MongoDB connection
async function migrateData() {
    console.log('Starting migration from MySQL to MongoDB Atlas...');

    // Connect to MongoDB
    const mongoClient = new MongoClient(process.env.DATABASE_URL);
    await mongoClient.connect();
    console.log('Connected to MongoDB Atlas');

    const db = mongoClient.db();

    try {
        // Migrate Categories
        console.log('Migrating categories...');
        const categories = await mysqlPrisma.category.findMany();
        if (categories.length > 0) {
            // Convert UUID strings to MongoDB ObjectId format and prepare data
            const categoriesForMongo = categories.map(category => ({
                name: category.name,
                // We'll keep track of the original IDs for reference
                originalId: category.id,
            }));
            await db.collection('Category').insertMany(categoriesForMongo);
        }

        // Create a mapping of old UUIDs to new MongoDB ObjectIDs
        const categoryMapping = {};
        const insertedCategories = await db.collection('Category').find({}).toArray();
        categories.forEach((oldCat, index) => {
            categoryMapping[oldCat.id] = insertedCategories[index]._id.toString();
        });

        // Migrate Products
        console.log('Migrating products...');
        const products = await mysqlPrisma.product.findMany();
        if (products.length > 0) {
            const productsForMongo = products.map(product => ({
                slug: product.slug,
                title: product.title,
                mainImage: product.mainImage,
                price: product.price,
                rating: product.rating,
                description: product.description,
                manufacturer: product.manufacturer,
                inStock: product.inStock,
                categoryId: categoryMapping[product.categoryId],
                originalId: product.id,
            }));
            await db.collection('Product').insertMany(productsForMongo);
        }

        // Create mapping for product IDs
        const productMapping = {};
        const insertedProducts = await db.collection('Product').find({}).toArray();
        products.forEach((oldProd, index) => {
            productMapping[oldProd.id] = insertedProducts[index]._id.toString();
        });

        // Migrate Images
        console.log('Migrating images...');
        const images = await mysqlPrisma.image.findMany();
        if (images.length > 0) {
            const imagesForMongo = images.map(image => ({
                productID: image.productID, // Keep original ID here, may need updating later
                image: image.image,
            }));
            await db.collection('Image').insertMany(imagesForMongo);
        }

        // Migrate Users
        console.log('Migrating users...');
        const users = await mysqlPrisma.user.findMany();
        if (users.length > 0) {
            const usersForMongo = users.map(user => ({
                email: user.email,
                password: user.password,
                role: user.role,
                originalId: user.id,
            }));
            await db.collection('User').insertMany(usersForMongo);
        }

        // Create mapping for user IDs
        const userMapping = {};
        const insertedUsers = await db.collection('User').find({}).toArray();
        users.forEach((oldUser, index) => {
            userMapping[oldUser.id] = insertedUsers[index]._id.toString();
        });

        // Migrate Customer_orders
        console.log('Migrating customer orders...');
        const customerOrders = await mysqlPrisma.customer_order.findMany();
        if (customerOrders.length > 0) {
            const ordersForMongo = customerOrders.map(order => ({
                name: order.name,
                lastname: order.lastname,
                phone: order.phone,
                email: order.email,
                company: order.company,
                adress: order.adress,
                apartment: order.apartment,
                postalCode: order.postalCode,
                dateTime: order.dateTime,
                status: order.status,
                city: order.city,
                country: order.country,
                orderNotice: order.orderNotice,
                total: order.total,
                originalId: order.id,
            }));
            await db.collection('Customer_order').insertMany(ordersForMongo);
        }

        // Create mapping for order IDs
        const orderMapping = {};
        const insertedOrders = await db.collection('Customer_order').find({}).toArray();
        customerOrders.forEach((oldOrder, index) => {
            orderMapping[oldOrder.id] = insertedOrders[index]._id.toString();
        });

        // Migrate customer_order_product
        console.log('Migrating order products...');
        const orderProducts = await mysqlPrisma.customer_order_product.findMany();
        if (orderProducts.length > 0) {
            const orderProductsForMongo = orderProducts.map(op => ({
                customerOrderId: orderMapping[op.customerOrderId],
                productId: productMapping[op.productId],
                quantity: op.quantity,
            }));
            await db.collection('customer_order_product').insertMany(orderProductsForMongo);
        }

        // Migrate Wishlist
        console.log('Migrating wishlist...');
        const wishlistItems = await mysqlPrisma.wishlist.findMany();
        if (wishlistItems.length > 0) {
            const wishlistForMongo = wishlistItems.map(item => ({
                productId: productMapping[item.productId],
                userId: userMapping[item.userId],
            }));
            await db.collection('Wishlist').insertMany(wishlistForMongo);
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mysqlPrisma.$disconnect();
        await mongoClient.close();
    }
}

migrateData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });