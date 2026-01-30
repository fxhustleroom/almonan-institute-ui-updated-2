import React from 'react';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card overflow-hidden">
      <div className="relative h-56 bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={product.title} src={product.coverUrl ?? '/mock/bookstore.png'} className="h-full w-full object-cover" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-almonanBrown-700 px-2 py-1 text-xs font-bold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-lg font-extrabold leading-tight">{product.title}</div>
        <div className="muted text-sm">{product.author ? `By ${product.author}` : ''}</div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-extrabold text-almonanBrown-700">
            {product.currency ?? '$'}{Number(product.price).toFixed(2)}
          </div>
          <button className="btn-primary !px-3 !py-2">🛒</button>
        </div>
      </div>
    </div>
  );
}
