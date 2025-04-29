// *********************
// Role of the component: Wishlist item component for wishlist page
// Name of the component: WishItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <WishItem id={id} title={title} price={price} image={image} slug={slug} stockAvailabillity={stockAvailabillity} />
// Input parameters: Props interface
// Output: single wishlist item on the wishlist page
// *********************

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/app/_zustand/cartStore";

interface Props {
  title: string;
  price: number;
  image: string;
  id: string;
  slug: string;
  stockAvailabillity: number;
}

const WishItem = ({
  title,
  price,
  image,
  id,
  slug,
  stockAvailabillity,
}: Props) => {
  const { cart, setCart } = useCartStore();
  const { data: session } = useSession();
  const { wishlist, setWishlist } = useWishlistStore();
  const [userId, setUserId] = useState("");
  const [wishId, setWishId] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Handle adding product to cart
  const handleAddToCart = () => {
    // Check if the item is already in the cart
    const isItemInCart = cart.some((item) => item.id === id);

    if (isItemInCart) {
      toast.error("Item is already in your cart!");
      return;
    }

    const newItem = {
      id,
      name: title,
      price,
      image,
      quantity: 1,
      slug,
    };

    setCart([...cart, newItem]);
    toast.success("Item added to cart!");
  };

  // Get the wishlist item ID so we can delete it
  const getWishlistItemId = async () => {
    if (session?.user) {
      try {
        // Use the new wishlist API directly
        const response = await fetch(`${apiBaseUrl}/wishlist`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const data = await response.json();
        // Find the wishlist item that matches the product ID
        const wishlistItem = data.find((item: any) => item.product.id === id);

        if (wishlistItem) {
          setWishId(wishlistItem.id);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    }
  };

  // Remove item from wishlist
  const handleRemove = async () => {
    try {
      if (wishId) {
        const response = await fetch(`${apiBaseUrl}/wishlist/${wishId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to remove from wishlist');
        }

        // Update local state
        const updatedWishlist = wishlist.filter(item => item.id !== id);
        setWishlist(updatedWishlist);
        toast.success("Item removed from wishlist!");
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error("Failed to remove from wishlist");
    }
  };

  useEffect(() => {
    getWishlistItemId();
  }, [session?.user, id]);

  return (
    <div className="w-full flex h-full gap-x-5 mb-5 pb-5 border-b border-gray-100">
      <div className="w-16 h-16 border border-slate-100 flex items-center justify-center">
        <img src={image} alt="" className="object-cover" />
      </div>
      <div className="flex w-full justify-between items-start">
        <div className="flex flex-col">
          <Link href={`/product/${slug}`}>
            <p className="text-base font-normal leading-normal text-slate-600">
              {title}
            </p>
          </Link>
          <p className="font-medium text-xl leading-normal text-slate-800">
            ${price}
          </p>
          <p className="text-sm font-normal text-slate-500">
            {stockAvailabillity > 0
              ? `Available Stock: ${stockAvailabillity}`
              : "Out of Stock"}
          </p>
        </div>
        <div className="flex flex-col">
          <button
            onClick={handleRemove}
            className="p-2 mb-2 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm"
          >
            Remove
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-sm"
            disabled={stockAvailabillity <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishItem;
