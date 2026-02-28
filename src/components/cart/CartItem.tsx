/**
 * CartItem — Displays a single item in the shopping cart.
 *
 * Shows artwork thumbnail, title, price, quantity controls (+/-),
 * and a remove button.
 */
"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useCartStore } from "@/stores/cartStore";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4 py-5 border-b border-secondary-warm">
      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-gallery overflow-hidden bg-secondary shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-foreground truncate">{item.title}</h3>
        <p className="text-sm text-muted">{item.medium}</p>
        <p className="text-accent font-bold mt-1">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Quantity controls + Remove */}
      <div className="flex flex-col items-end justify-between">
        {/* Quantity */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="cursor-pointer p-1.5 rounded-full border border-primary/15 hover:bg-secondary transition-all min-h-touch min-w-[32px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            aria-label={`Decrease quantity of ${item.title}`}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-medium text-foreground">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="cursor-pointer p-1.5 rounded-full border border-primary/15 hover:bg-secondary transition-all min-h-touch min-w-[32px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            aria-label={`Increase quantity of ${item.title}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Remove button */}
        <button
          onClick={() => removeItem(item.id)}
          className="cursor-pointer p-2 text-error hover:text-error/80 hover:bg-error/10 rounded-full transition-all min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-1"
          aria-label={`Remove ${item.title} from cart`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
