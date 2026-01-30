import Link from 'next/link';
import React from 'react';
import type { Course } from '@/lib/types';

export function CourseCard({ course }: { course: Course }) {
  const priceLabel =
    course.isFree || course.price === 0 || course.price == null ? 'FREE' : `$${Number(course.price).toFixed(2)}`;

  return (
    <div className="card overflow-hidden">
      <div className="relative h-44 w-full bg-black/5">
        {/* Use real thumbnailUrl when backend provides it */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={course.title}
          src={course.thumbnailUrl ?? '/mock/course-details.png'}
          className="h-full w-full object-cover"
        />
        {course.price != null && course.price > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-almonanGreen-500 px-2 py-1 text-xs font-bold text-white">
            POPULAR
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="text-sm font-extrabold">{course.title}</div>
        <p className="muted line-clamp-2 text-sm">{course.shortDescription ?? course.description ?? ''}</p>

        <div className="flex items-center justify-between pt-2">
          <div className={course.isFree ? 'text-almonanGreen-700 font-extrabold' : 'text-almonanGreen-700 font-extrabold'}>
            {priceLabel}
          </div>
          <Link href={`/courses/${course.id}`} className="btn-outline !px-4 !py-2">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
