// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductsSection slug={slug} />
// Input parameters: no input parameters
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";

const ProductsSection = async () => {
  try {
    // Use absolute URL for server component
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const data = await fetch(`${apiUrl}/api/products`, {
      cache: 'no-store' // Using no-store instead of both cache and revalidate
    });

    if (!data.ok) {
      throw new Error(`Failed to fetch products: ${data.statusText}`);
    }

    const response = await data.json();
    const products = response.products || []; // Make sure we're accessing the products array correctly

    return (
      <div className="bg-blue-500 border-t-4 border-white">
        <div className="max-w-screen-2xl mx-auto pt-20">
          <Heading title="FEATURED PRODUCTS" />
          <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-2 px-10 gap-y-8 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <ProductItem key={product.id} product={product} color="white" />
              ))
            ) : (
              <p className="text-white col-span-4">No products available at this time.</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading products:", error);
    return (
      <div className="bg-blue-500 border-t-4 border-white">
        <div className="max-w-screen-2xl mx-auto pt-20">
          <Heading title="FEATURED PRODUCTS" />
          <div className="py-10 text-center text-white">
            Unable to load products. Please try again later.
          </div>
        </div>
      </div>
    );
  }
};

export default ProductsSection;
