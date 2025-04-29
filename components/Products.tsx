// *********************
// Role of the component: Showing products on the shop page with applied filter and sort
// Name of the component: Products.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Products slug={slug} />
// Input parameters: { slug }: any
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";

const Products = async ({ slug }: any) => {
  // getting all data from URL slug and preparing everything for sending GET request
  const inStockNum = slug?.searchParams?.inStock === "true" ? 1 : 0;
  const outOfStockNum = slug?.searchParams?.outOfStock === "true" ? 1 : 0;
  const page = slug?.searchParams?.page ? Number(slug?.searchParams?.page) : 1;

  let stockMode: string = "lte";

  // preparing inStock and out of stock filter for GET request
  // If in stock checkbox is checked, stockMode is "equals"
  if (inStockNum === 1) {
    stockMode = "equals";
  }
  // If out of stock checkbox is checked, stockMode is "lt"
  if (outOfStockNum === 1) {
    stockMode = "lt";
  }
  // If in stock and out of stock checkboxes are checked, stockMode is "lte"
  if (inStockNum === 1 && outOfStockNum === 1) {
    stockMode = "lte";
  }
  // If in stock and out of stock checkboxes aren't checked, stockMode is "gt"
  if (inStockNum === 0 && outOfStockNum === 0) {
    stockMode = "gt";
  }

  try {
    // For Next.js server components, we need to use absolute URLs for fetch
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Construct API endpoint with query parameters
    const url = `${API_BASE}/products?filters[price][$lte]=${slug?.searchParams?.price || 3000
      }&filters[rating][$gte]=${Number(slug?.searchParams?.rating) || 0
      }&filters[inStock][$${stockMode}]=1&${slug?.params?.slug?.length > 0
        ? `filters[category][$equals]=${slug?.params?.slug}&`
        : ""
      }sort=${slug?.searchParams?.sort}&page=${page}`;

    // Fetch data with appropriate caching strategy
    const data = await fetch(url, { next: { revalidate: 3600 } });

    if (!data.ok) {
      throw new Error(`Failed to fetch products: ${data.statusText}`);
    }

    const products = await data.json();

    return (
      <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
        {products.length > 0 ? (
          products.map((product: Product) => (
            <ProductItem key={product.id} product={product} color="black" />
          ))
        ) : (
          <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
            No products found for specified query
          </h3>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="grid grid-cols-1">
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          Error loading products. Please try again later.
        </h3>
      </div>
    );
  }
};

export default Products;
