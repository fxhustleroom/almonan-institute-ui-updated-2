import React from 'react';
import type { Book } from '@/lib/types';

export function BookCard({ book }: { book: Book }) {
  return (
    <div className="card overflow-hidden">
      <div className="relative h-56 bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={book.title}
          src={book.coverUrl ?? '/mock/library.png'}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-3 top-3 rounded-md bg-almonanGreen-500 px-2 py-1 text-xs font-bold text-white">
          {book.isFree ? 'FREE' : 'PAID'}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <div className="text-[11px] font-extrabold tracking-widest text-almonanGreen-700">{(book.category ?? '').toUpperCase() || 'RESOURCE'}</div>
        <div className="text-lg font-extrabold">{book.title}</div>
        <div className="muted text-sm">{book.author ? `By ${book.author}` : ''}</div>
        <div className="mt-3 flex gap-2">
          <button className="btn-primary !px-4 !py-2">Read</button>
          <button className="btn-outline !px-4 !py-2">Download</button>
        </div>
      </div>
    </div>
  );
}
