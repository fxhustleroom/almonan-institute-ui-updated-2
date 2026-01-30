export type Money = {
  amount: number;
  currency: string; // e.g. NGN
};

export type Course = {
  id: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  currency?: string | null;
  level?: string | null;
  thumbnailUrl?: string | null;
  rating?: number | null;
  studentsCount?: number | null;
  isFree?: boolean | null;
};

export type CourseModule = {
  id: string;
  title: string;
  order: number;
  locked?: boolean;
  lessonsCount?: number;
};

export type Book = {
  id: string;
  title: string;
  author?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  isFree?: boolean | null;
  price?: number | null;
  currency?: string | null;
};

export type Product = {
  id: string;
  title: string;
  author?: string | null;
  price: number;
  currency?: string | null;
  coverUrl?: string | null;
  badge?: string | null;
};

export type SupportTicketInput = {
  fullName: string;
  contact: string; // email or phone
  subject: string;
  message: string;
};
