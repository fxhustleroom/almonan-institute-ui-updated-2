import { api } from '@/lib/api';
import type { Book, Course, Product, SupportTicketInput } from '@/lib/types';

// Helper: support both { success, data } and direct response bodies
function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

// -----------------------
// Public
// -----------------------

export async function fetchPublicCourses(params?: {
  q?: string;
  category?: string;
  price?: 'free' | 'paid' | 'all';
  page?: number;
}) {
  const res = await api.get('/public/courses', { params });
  const data = unwrap<Course[] | { items: Course[] }>(res);

  // Some APIs return { items: [] }
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchPublicCourse(courseId: string) {
  const res = await api.get(`/public/courses/${courseId}`);
  return unwrap<Course>(res);
}

export async function fetchLibraryBooks(params?: { q?: string; category?: string }) {
  const res = await api.get('/library/books', { params });
  const data = unwrap<Book[] | { items: Book[] }>(res);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchBookstoreProducts(params?: { q?: string; category?: string; page?: number }) {
  const res = await api.get('/bookstore/products', { params });
  const data = unwrap<Product[] | { items: Product[] }>(res);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function createSupportTicket(payload: SupportTicketInput) {
  const res = await api.post('/support/tickets', payload);
  return unwrap(res);
}

// -----------------------
// Auth
// -----------------------

export type LoginPayload = { emailOrPhone: string; password: string };
export type AuthUser = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
};
export type LoginResponse = { accessToken: string; refreshToken: string; user: AuthUser };

export async function login(payload: LoginPayload) {
  const res = await api.post('/auth/login', payload);
  return unwrap<LoginResponse>(res);
}

export type RegisterOnlinePayload = {
  fullName: string;
  emailOrPhone: string;
  password: string;
  confirmPassword?: string;
  agreeToTerms: boolean;
};

export async function registerOnline(payload: RegisterOnlinePayload) {
  const res = await api.post('/auth/register/online', payload);
  return unwrap(res);
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
  return unwrap(res);
}

export async function requestPasswordReset(payload: { emailOrPhone: string }) {
  const res = await api.post('/auth/password/forgot', payload);
  return unwrap(res);
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
  return unwrap<MeResponse>(res);
}

// aliases (your profile page imports these names)
export const me = fetchMe;

export async function updateMe(payload: { fullName?: string; email?: string; phone?: string; bio?: string }) {
  const res = await api.patch('/me', payload);
  return unwrap<MeResponse>(res);
}

export type StudentSettingsPayload = {
  displayName: string;
  darkMode: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    announcements: boolean;
    examReminders: boolean;
  };
};

export async function updateStudentSettings(payload: StudentSettingsPayload) {
  const res = await api.patch('/me/settings', payload);
  return unwrap(res);
}

export async function updatePrivacy(payload: { profileVisible: boolean }) {
  const res = await api.patch('/me/privacy', payload);
  return unwrap<MeResponse>(res);
}

// Avatar upload: presign -> PUT -> notify API
export type PresignResponse = { uploadId: string; uploadUrl: string; publicUrl: string };

export async function presignUpload(payload: {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose?: string;
}) {
  const res = await api.post('/uploads/presign', payload);
  return unwrap<PresignResponse>(res);
}

export async function setAvatar(payload: { uploadId: string; url: string }) {
  const res = await api.post('/me/avatar', payload);
  return unwrap<MeResponse>(res);
}

// alias (your profile page imports updateMeAvatar)
export const updateMeAvatar = setAvatar;

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
  type: string;
  title: string;
  subtitle?: string;
  createdAt: string;
};

export type CourseProgress = {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
};

export async function fetchStudentDashboard() {
  const res = await api.get('/me/dashboard');
  return unwrap(res) as {
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
  const data = unwrap<EnrolledCourseCard[] | { items: EnrolledCourseCard[] }>(res);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

// -----------------------
// Assignments
// -----------------------

export type AssignmentStatus = 'pending' | 'submitted' | 'late' | string;

export type MyAssignment = {
  id: string;
  courseTitle: string;
  courseCode?: string;
  section?: string;
  title: string;
  dueDate?: string; // ISO string preferred
  status: AssignmentStatus;
};

export type AssignmentDetails = {
  id: string;
  courseTitle?: string;
  moduleTitle?: string;
  title: string;
  dueDate?: string; // ISO
  pointsPossible?: number;
  status?: AssignmentStatus;
};

export async function fetchMyAssignments() {
  const res = await api.get('/assignments/my');
  const data = unwrap<MyAssignment[] | { items: MyAssignment[] }>(res);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchAssignment(assignmentId: string) {
  // If your backend does NOT have this endpoint, we will fall back to list later.
  const res = await api.get(`/assignments/${assignmentId}`);
  return unwrap<AssignmentDetails>(res);
}

export async function submitAssignment(payload: {
  assignmentId: string;
  note?: string;
  files: Array<{ uploadId: string; url: string }>;
}) {
  const res = await api.post(`/assignments/${payload.assignmentId}/submissions`, {
    note: payload.note,
    files: payload.files
  });
  return unwrap(res);
}

// -----------------------
// Exams
// -----------------------

export type ExamStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded' | string;

export type ExamListItem = {
  id: string;
  title: string;
  courseTitle?: string;
  courseSlug?: string;
  sectionLabel?: string; // e.g. "Section B: Macroeconomic Foundations"
  durationSeconds?: number; // e.g. 3600
  totalQuestions?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: ExamStatus;
};

export async function fetchMyExams(params?: { q?: string; status?: string; page?: number }) {
  const res = await api.get('/exams', { params });
  const data = unwrap<ExamListItem[] | { items: ExamListItem[] }>(res);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

// When the student starts (or resumes) an exam, backend returns an attempt
export type ExamAttempt = {
  attemptId: string;
  examId: string;
  title: string;
  courseBreadcrumb?: string; // e.g. "COURSES > ECONOMICS"
  sectionLabel?: string; // e.g. "Section B: Macroeconomic Foundations"
  totalQuestions: number;
  currentQuestionIndex: number; // 0-based
  timeRemainingSeconds: number;
  flaggedQuestionIndexes?: number[]; // 0-based
  answers?: Record<string, string | null>; // questionId -> optionId
  questions: Array<{
    id: string;
    index: number; // 1-based for display
    prompt: string;
    options: Array<{ id: string; text: string }>;
  }>;
};

export async function startOrResumeExam(examId: string) {
  // Common patterns: POST /exams/:id/start or /exams/:id/attempt
  // If your backend differs, adjust this one line.
  const res = await api.post(`/exams/${examId}/start`, {});
  return unwrap<ExamAttempt>(res);
}

export async function fetchExamAttempt(examId: string) {
  // Common pattern: GET /exams/:id/attempt
  const res = await api.get(`/exams/${examId}/attempt`);
  return unwrap<ExamAttempt>(res);
}

export async function saveExamAnswer(payload: { examId: string; questionId: string; optionId: string | null }) {
  // Common pattern: POST /exams/:id/answer
  const res = await api.post(`/exams/${payload.examId}/answer`, {
    questionId: payload.questionId,
    optionId: payload.optionId
  });
  return unwrap(res);
}

export async function toggleExamFlag(payload: { examId: string; questionIndex: number; flagged: boolean }) {
  // Common pattern: POST /exams/:id/flag
  const res = await api.post(`/exams/${payload.examId}/flag`, payload);
  return unwrap(res);
}

export async function submitExam(payload: { examId: string }) {
  // Common pattern: POST /exams/:id/submit
  const res = await api.post(`/exams/${payload.examId}/submit`, {});
  return unwrap(res);
}

// -----------------------
// Certificates
// -----------------------

export type CertificateItem = {
  id: string;
  title: string;
  courseTitle?: string | null;
  issuedAt?: string | null; // ISO date
  pdfUrl?: string | null;
  previewUrl?: string | null;
  status?: 'verified' | 'pending' | string;
};

export type CertificatesStats = {
  totalEarned: number;
  latestAwardDate?: string | null; // ISO date
  gpaEquivalent?: number | null;
  creditsValid?: number | null;
};

export type CertificatesResponse = {
  stats?: CertificatesStats;
  items: CertificateItem[];
};

export async function fetchMyCertificates(params?: { q?: string; page?: number }) {
  // Preferred pattern: /me/...
  const res = await api.get('/me/certificates', { params });
  const data = unwrap<CertificatesResponse | CertificateItem[] | { items: CertificateItem[]; stats?: CertificatesStats }>(res);

  if (Array.isArray(data)) return { items: data, stats: undefined } as CertificatesResponse;
  const items = Array.isArray((data as any)?.items) ? (data as any).items : [];
  const stats = (data as any)?.stats;
  return { items, stats } as CertificatesResponse;
}

export async function downloadCertificatesBundle() {
  // Backend should return a URL or a file stream.
  // If it returns { url }, we open it in the UI.
  const res = await api.post('/me/certificates/bundle');
  return unwrap<{ url?: string }>(res);
}

export async function shareCertificates(payload: { certificateIds: string[] }) {
  // Backend can return a share link { url }
  const res = await api.post('/me/certificates/share', payload);
  return unwrap<{ url?: string }>(res);
}

// -----------------------
// Settings
// -----------------------

export type StudentSettings = {
  notificationsEmail?: boolean;
  notificationsSms?: boolean;
  announcements?: boolean;
  examReminders?: boolean;
  darkMode?: boolean; // if you support it later
};

export async function fetchMySettings() {
  const res = await api.get('/me/settings');
  return unwrap<StudentSettings>(res);
}

export async function updateMySettings(payload: Partial<StudentSettings>) {
  const res = await api.patch('/me/settings', payload);
  return unwrap<StudentSettings>(res);
}
