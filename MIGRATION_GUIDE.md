# Data Migration Guide

This guide will help you migrate your existing data from the previous database to MongoDB Atlas.

## Prerequisites

- MongoDB Atlas account set up
- Connection string in your `.env` file
- Admin access to your previous database

## Option 1: Using the Automated Migration Script

The project includes a migration script that can transfer your data from the previous database to MongoDB Atlas.

1. **Set up your old database connection**

   Create a `.env.mysql` file in the root directory with your old database connection:

   ```
   # For MySQL/SQLite
   MYSQL_DATABASE_URL="your_old_connection_string"
   ```

2. **Run the migration script**

   ```bash
   npm run migrate-to-mongodb
   ```

   This will transfer your products, categories, users, orders, and other data from the old database to MongoDB Atlas.

## Option 2: Manual Migration

If you prefer to control the migration process manually, follow these steps:

1. **Export data from your old database**

   Use appropriate tools to export your data to JSON format:
   - For MySQL: Use mysqldump or Workbench
   - For SQLite: Use the SQLite CLI or a GUI tool

2. **Transform the data**

   You may need to transform certain fields to match the MongoDB schema:
   - Convert IDs to ObjectId format
   - Update relationship references
   - Format dates correctly

3. **Import into MongoDB Atlas**

   Use MongoDB Compass or the MongoDB CLI to import your transformed data:

   ```bash
   mongoimport --uri="your_mongodb_atlas_connection_string" --collection=products --file=products.json --jsonArray
   ```

   Repeat for each collection (users, categories, orders, etc.)

## Verifying Your Data

After migration, verify that all your data has been transferred correctly:

1. **Run the development server**

   ```bash
   npm run dev
   ```

2. **Log in to the application**

   Use your existing admin credentials to log in.

3. **Check the dashboard**

   Verify that all products, categories, users, and orders are displayed correctly.

## Troubleshooting

- **Missing relationships**: Make sure all references between collections are maintained.
- **ID format issues**: Ensure MongoDB ObjectId fields are properly formatted.
- **Date conversion issues**: Check that date fields are properly converted to MongoDB's date format.

If you encounter any issues, you can contact our support team for assistance.