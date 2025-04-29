"use client";

// *********************
// Role of the component: Button for adding and removing product to the wishlist on the single product page
// Name of the component: AddToWishlistBtn.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <AddToWishlistBtn title={title} price={price} image={image} productId={productId} slug={slug} stockAvailabillity={stockAvailabillity} />
// Input parameters: AddToWishlistBtnProps interface
// Output: Button with adding and removing from the wishlist functionality
// *********************

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface AddToWishlistBtnProps {
  title: string;
  price: number;
  image: string;
  productId: string;
  slug: string;
  stockAvailabillity: number;
}

const AddToWishlistBtn = ({
  title,
  price,
  image,
  productId,
  slug,
  stockAvailabillity,
}: AddToWishlistBtnProps) => {
  const { data: session } = useSession();
  const { wishlist, setWishlist } = useWishlistStore();
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Check if the product is in the wishlist
  const isInWishlist = wishlist.some((item) => item.id === productId);

  // Add product to wishlist
  const handleAddToWishlist = async () => {
    if (!session || !session.user) {
      toast.error("Please login to add products to wishlist");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }

    try {
      // Use the new API endpoint for adding to wishlist
      const response = await fetch(`${apiBaseUrl}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === "Item already in wishlist") {
          toast.error("This product is already in your wishlist");
        } else {
          throw new Error(errorData.message || "Failed to add to wishlist");
        }
        return;
      }

      // Update local state
      const newItem = {
        id: productId,
        title,
        price,
        image,
        slug,
        stockAvailabillity,
      };
      setWishlist([...wishlist, newItem]);
      toast.success("Product added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add product to wishlist");
    }
  };

  // Remove product from wishlist
  const handleRemoveFromWishlist = async () => {
    if (!session?.user) {
      return;
    }

    try {
      // First, get the wishlist to find the item ID
      const response = await fetch(`${apiBaseUrl}/wishlist`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      const wishlistItem = data.find((item: any) => item.product.id === productId);

      if (!wishlistItem) {
        toast.error("Item not found in wishlist");
        return;
      }

      // Delete the wishlist item
      const deleteResponse = await fetch(`${apiBaseUrl}/wishlist/${wishlistItem.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      // Update local state
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(updatedWishlist);
      toast.success("Product removed from wishlist!");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove product from wishlist");
    }
  };

  return (
    <button
      onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
      className="border border-slate-200 p-3 flex items-center justify-center group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="27"
        height="27"
        viewBox="0 0 24 24"
        className={`group-hover:fill-red-500 ${isInWishlist ? "fill-red-500" : "fill-none"} group-hover:stroke-red-500 stroke-slate-700`}
      >
        <path
          d="M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
};

export default AddToWishlistBtn;
