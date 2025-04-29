"use client";

import React, { useEffect } from "react";
import WishItem from "@/components/WishItem";
import Breadcrumb from "@/components/Breadcrumb";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "../_zustand/wishlistStore";

const Wishlist = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishlist, setWishlist } = useWishlistStore();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Check if user is logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch wishlist items directly from MongoDB API
  const fetchWishlist = async () => {
    if (session?.user) {
      try {
        const response = await fetch(`${apiBaseUrl}/wishlist`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const wishlistData = await response.json();
        const productArray = wishlistData.map((item: any) => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.mainImage,
          slug: item.product.slug,
          stockAvailabillity: item.product.inStock
        }));

        setWishlist(productArray);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    }
  }, [session?.user]);

  return (
    <section className="max-w-screen-2xl mx-auto px-16 max-[600px]:px-5 max-[1100px]:px-10 py-12 bg-[#F7F8F9] min-h-screen">
      <Breadcrumb />
      <h1 className="text-4xl font-semibold my-5 mb-10">
        Wishlist ({wishlist.length})
      </h1>
      <div className="bg-white p-16 max-[600px]:p-5 max-[1100px]:p-10">
        {wishlist.length === 0 && (
          <p className="text-lg text-center py-10">Your wishlist is empty.</p>
        )}
        {wishlist.map((item) => (
          <WishItem
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            image={item.image}
            slug={item.slug}
            stockAvailabillity={item.stockAvailabillity}
          />
        ))}
      </div>
    </section>
  );
};

export default Wishlist;
