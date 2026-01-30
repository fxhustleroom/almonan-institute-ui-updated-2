import { api } from '@/lib/api';
import type { Book, Course, Product, SupportTicketInput } from '@/lib/types';

export async function fetchPublicCourses(params?: { q?: string; category?: string; price?: 'free'|'paid'|'all'; page?: number }) {
  const res = await api.get<Course[]>('/public/courses', { params });
  return res.data;
}

export async function fetchPublicCourse(courseId: string) {
  const res = await api.get<Course>(`/public/courses/${courseId}`);
  return res.data;
}

export async function fetchLibraryBooks(params?: { q?: string; category?: string }) {
  const res = await api.get<Book[]>('/library/books', { params });
  return res.data;
}

export async function fetchBookstoreProducts(params?: { q?: string; category?: string; page?: number }) {
  const res = await api.get<Product[]>('/bookstore/products', { params });
  return res.data;
}

export async function createSupportTicket(payload: SupportTicketInput) {
  const res = await api.post('/support/tickets', payload);
  return res.data;
}

// -----------------------
// Auth
// -----------------------

export type LoginPayload = { emailOrPhone: string; password: string };
export type AuthUser = { id: string; fullName: string; email?: string | null; phone?: string | null; role: string };
export type LoginResponse = { accessToken: string; refreshToken: string; user: AuthUser };

export async function login(payload: LoginPayload) {
  const res = await api.post('/auth/login', payload);
  // supports envelope or direct
  return (res.data?.data ?? res.data) as LoginResponse;
}


export type RegisterOnlinePayload = {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
  agreeToTerms: boolean;
};

export async function registerOnline(payload: RegisterOnlinePayload) {
  const res = await api.post('/auth/register/online', payload);
  return res.data?.data ?? res.data;
}

export type RegisterOfflinePayload = {
  fullName: string;
  phone: string;
  matricNumber: string;
  department: string;
  level: string;
  agreeToTerms: boolean;
};

export async function registerOffline(payload: RegisterOfflinePayload) {
  const res = await api.post('/auth/register/offline', payload);
  return res.data?.data ?? res.data;
}

export async function requestPasswordReset(payload: { identifier: string }) {
  // NOTE: make sure this endpoint exists in backend; your log shows /auth/password/forgot may be different
  const res = await api.post('/auth/password/forgot', payload);
  return res.data?.data ?? res.data;
}
// -----------------------
// Me / Profile
// -----------------------

export type MeResponse = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  matricNumber?: string | null;
  department?: string | null;
  level?: string | null;
  bio?: string | null;
  profileVisible?: boolean;
  avatarUrl?: string | null;
};

export async function fetchMe() {
  const res = await api.get('/me');
  return (res.data?.data ?? res.data) as MeResponse;
}

export async function updateMe(payload: { fullName?: string; phone?: string; bio?: string }) {
  const res = await api.patch('/me', payload);
  return (res.data?.data ?? res.data) as MeResponse;
}

export async function updatePrivacy(payload: { profileVisible: boolean }) {
  const res = await api.patch('/me/privacy', payload);
  return (res.data?.data ?? res.data) as MeResponse;
}

// Avatar upload: presign -> PUT to uploadUrl -> notify API
export type PresignResponse = { uploadId: string; uploadUrl: string; publicUrl: string };
export async function presignUpload(payload: { filename: string; contentType: string; sizeBytes: number; purpose?: string }) {
  const res = await api.post('/uploads/presign', payload);
  return (res.data?.data ?? res.data) as PresignResponse;
}

export async function setAvatar(payload: { uploadId: string; url: string }) {
  const res = await api.post('/me/avatar', payload);
  return (res.data?.data ?? res.data) as MeResponse;
}

// -----------------------
// Student dashboard + learning
// -----------------------

export type DashboardStats = {
  activeCourses: number;
  pendingAssignments: number;
  upcomingExams: number;
  certificatesEarned: number;
};

export type ActivityItem = {
  id: string;
  type: 'assignment_submitted' | 'grade_published' | 'enrollment_confirmed' | string;
  title: string;
  subtitle?: string;
  createdAt: string;
};

export type CourseProgress = {
  courseId: string;
  courseTitle: string;
  progressPercent: number; // 0..100
};

export async function fetchStudentDashboard() {
  // Expected: { stats, recentActivity, courseProgress }
  const res = await api.get('/me/dashboard');
  return (res.data?.data ?? res.data) as {
    stats: DashboardStats;
    recentActivity: ActivityItem[];
    courseProgress: CourseProgress[];
  };
}

export type EnrolledCourseCard = {
  id: string;
  title: string;
  instructorName?: string;
  coverImageUrl?: string;
  progressPercent?: number;
  currentTopic?: string;
  totalModules?: number;
};

export async function fetchMyEnrolledCourses(params?: { q?: string }) {
  const res = await api.get('/courses/enrolled', { params });
  return (res.data?.data ?? res.data) as EnrolledCourseCard[];
}

export type LearningModule = {
  id: string;
  title: string;
  order: number;
  lessonsCount?: number;
  status?: 'locked' | 'completed' | 'in_progress' | string;
};

export type LessonListItem = {
  id: string;
  title: string;
  order: number;
  type?: 'video' | 'reading' | 'assignment' | string;
  durationSeconds?: number;
  status?: 'locked' | 'completed' | 'in_progress' | string;
};

export async function fetchCourseLearningOutline(courseId: string) {
  // Returns course + modules + lessons grouped or flattened
  const res = await api.get(`/learning/courses/${courseId}/outline`);
  return (res.data?.data ?? res.data) as {
    courseId: string;
    courseTitle: string;
    modules: LearningModule[];
    lessons: Record<string, LessonListItem[]>; // moduleId -> lessons
    overallProgressPercent?: number;
  };
}

export async function fetchLesson(lessonId: string) {
  const res = await api.get(`/learning/lessons/${lessonId}`);
  return (res.data?.data ?? res.data) as {
    id: string;
    title: string;
    moduleTitle?: string;
    courseTitle?: string;
    videoUrl?: string | null;
    readingHtml?: string | null;
    resources?: Array<{ id: string; title: string; url: string; type?: string }>;
    progressPercent?: number;
    canDownloadPdf?: boolean;
  };
}

export async function markLessonComplete(payload: { lessonId: string }) {
  const res = await api.post('/learning/lessons/complete', payload);
  return res.data?.data ?? res.data;
}

// -----------------------
// Q&A
// -----------------------

export type QnaThread = {
  id: string;
  title: string;
  body?: string;
  status: 'unanswered' | 'answered' | 'closed' | string;
  repliesCount?: number;
  likesCount?: number;
  createdAt: string;
  staffResponseSnippet?: string;
};

export async function fetchQnaThreads(params: { moduleId: string; q?: string; status?: string; page?: number }) {
  const res = await api.get('/qna/threads', { params });
  return (res.data?.data ?? res.data) as { items: QnaThread[]; nextPage?: number | null };
}

export async function createQnaThread(payload: { moduleId: string; title: string; body: string }) {
  const res = await api.post('/qna/threads', payload);
  return res.data?.data ?? res.data;
}

// -----------------------
// Quizzes
// -----------------------

export type QuizAttempt = {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds?: number;
  questions: Array<{
    id: string;
    index: number;
    prompt: string;
    options: Array<{ id: string; text: string }>;
    selectedOptionId?: string | null;
  }>;
};

export async function fetchQuizAttempt(attemptId: string) {
  const res = await api.get(`/quizzes/attempts/${attemptId}`);
  return (res.data?.data ?? res.data) as QuizAttempt;
}

export async function saveQuizAnswer(payload: { attemptId: string; questionId: string; optionId: string }) {
  const res = await api.post('/quizzes/attempts/answer', payload);
  return res.data?.data ?? res.data;
}

export async function submitQuizAttempt(payload: { attemptId: string }) {
  const res = await api.post('/quizzes/attempts/submit', payload);
  return res.data?.data ?? res.data;
}

