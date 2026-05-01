import { api } from './api';
import type { Book, Course, Product, SupportTicketInput } from './types';

function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

// Public
export async function fetchPublicCourses(params?: { q?: string; category?: string; price?: 'free' | 'paid' | 'all'; page?: number }) {
  const res = await api.get('/public/courses', { params });
  const data = unwrap<Course[] | { items: Course[] }>(res);
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchPublicCourse(courseId: string) {
  const res = await api.get(`/public/courses/${courseId}`);
  return unwrap<Course>(res);
}

export async function fetchLibraryBooks(params?: { q?: string; category?: string }) {
  const res = await api.get('/library/books', { params });
  const data = unwrap<Book[] | { items: Book[] }>(res);
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchBookstoreProducts(params?: { q?: string; category?: string; page?: number }) {
  const res = await api.get('/bookstore/products', { params });
  const data = unwrap<Product[] | { items: Product[] }>(res);
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function createSupportTicket(payload: SupportTicketInput) {
  const res = await api.post('/support/tickets', payload);
  return unwrap(res);
}

// Auth
export type LoginPayload = { emailOrPhone: string; password: string };

export type AuthUser = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export async function login(payload: LoginPayload) {
  const res = await api.post('/auth/login', payload);
  return unwrap<LoginResponse>(res);
}

export type RegisterOnlinePayload = {
  fullName: string;
  emailOrPhone?: string;
  email?: string;
  phone?: string;
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

export async function register(payload: RegisterOnlinePayload | RegisterOfflinePayload | any) {
  if ('matricNumber' in payload || 'department' in payload || 'level' in payload) {
    return registerOffline(payload);
  }
  return registerOnline(payload);
}

export async function requestPasswordReset(payload: { emailOrPhone: string }) {
  const res = await api.post('/auth/password/forgot', payload);
  return unwrap(res);
}

// Me / Profile
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

export type PresignResponse = {
  uploadId: string;
  uploadUrl: string;
  publicUrl: string;
};

export async function presignUpload(payload: { filename: string; contentType: string; sizeBytes: number; purpose?: string }) {
  const res = await api.post('/uploads/presign', payload);
  return unwrap<PresignResponse>(res);
}

export async function setAvatar(payload: { uploadId: string; url: string }) {
  const res = await api.post('/me/avatar', payload);
  return unwrap<MeResponse>(res);
}

export const updateMeAvatar = setAvatar;

// Student dashboard + learning
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
  createdAt?: string;
  timestamp?: string;
};

export type CourseProgress = {
  courseId: string;
  courseTitle: string;
  progressPercent?: number;
  percent?: number;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  courseProgress: CourseProgress[];
};

export async function fetchStudentDashboard() {
  const res = await api.get('/me/dashboard');
  return unwrap(res) as DashboardResponse;
}

export const fetchDashboard = fetchStudentDashboard;

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
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export const fetchMyCourses = fetchMyEnrolledCourses;

export type CourseOutline = any;
export type Lesson = any;

export async function fetchCourseDetails(courseId: string) {
  const res = await api.get(`/courses/${courseId}`);
  return unwrap(res);
}

export async function fetchCourseOutline(courseId: string) {
  const res = await api.get(`/courses/${courseId}/outline`);
  return unwrap(res);
}

export async function fetchLesson(courseId: string, lessonId: string) {
  const res = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
  return unwrap(res);
}

// Assignments
export type AssignmentStatus = 'pending' | 'submitted' | 'late' | string;

export type MyAssignment = {
  id: string;
  courseTitle: string;
  courseCode?: string;
  section?: string;
  title: string;
  dueDate?: string;
  status: AssignmentStatus;
};

export type AssignmentDetails = {
  id: string;
  courseTitle?: string;
  moduleTitle?: string;
  title: string;
  dueDate?: string;
  pointsPossible?: number;
  status?: AssignmentStatus;
};

export async function fetchMyAssignments() {
  const res = await api.get('/assignments/my');
  const data = unwrap<MyAssignment[] | { items: MyAssignment[] }>(res);
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export async function fetchAssignment(assignmentId: string) {
  const res = await api.get(`/assignments/${assignmentId}`);
  return unwrap<AssignmentDetails>(res);
}

export async function submitAssignment(payload: { assignmentId: string; note?: string; files: Array<{ uploadId: string; url: string }> }) {
  const res = await api.post(`/assignments/${payload.assignmentId}/submissions`, {
    note: payload.note,
    files: payload.files
  });
  return unwrap(res);
}

// Exams
export type ExamStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded' | string;

export type ExamListItem = {
  id: string;
  title: string;
  courseTitle?: string;
  courseSlug?: string;
  sectionLabel?: string;
  durationSeconds?: number;
  totalQuestions?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: ExamStatus;
};

export async function fetchMyExams(params?: { q?: string; status?: string; page?: number }) {
  const res = await api.get('/exams', { params });
  const data = unwrap<ExamListItem[] | { items: ExamListItem[] }>(res);
  return Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
}

export type ExamAttempt = {
  attemptId: string;
  examId: string;
  title: string;
  courseBreadcrumb?: string;
  sectionLabel?: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  flaggedQuestionIndexes?: number[];
  answers?: Record<string, string | null>;
  questions: Array<{
    id: string;
    index: number;
    prompt: string;
    options: Array<{ id: string; text: string }>;
  }>;
};

export async function startOrResumeExam(examId: string) {
  const res = await api.post(`/exams/${examId}/start`, {});
  return unwrap<ExamAttempt>(res);
}

export async function fetchExamAttempt(examId: string) {
  const res = await api.get(`/exams/${examId}/attempt`);
  return unwrap<ExamAttempt>(res);
}

export async function saveExamAnswer(payload: { examId: string; questionId: string; optionId: string | null }) {
  const res = await api.post(`/exams/${payload.examId}/answer`, {
    questionId: payload.questionId,
    optionId: payload.optionId
  });
  return unwrap(res);
}

export async function toggleExamFlag(payload: { examId: string; questionIndex: number; flagged: boolean }) {
  const res = await api.post(`/exams/${payload.examId}/flag`, payload);
  return unwrap(res);
}

export async function submitExam(payload: { examId: string }) {
  const res = await api.post(`/exams/${payload.examId}/submit`, {});
  return unwrap(res);
}

export const fetchQuizAttempt = fetchExamAttempt;

export async function submitQuizAnswer(payload: { quizId?: string; examId?: string; questionId: string; optionId: string | null }) {
  return saveExamAnswer({
    examId: payload.examId || payload.quizId || '',
    questionId: payload.questionId,
    optionId: payload.optionId
  });
}

export async function finalizeQuizAttempt(payload: { quizId?: string; examId?: string }) {
  return submitExam({
    examId: payload.examId || payload.quizId || ''
  });
}

// QNA
export async function fetchQnaThreads(moduleId: string) {
  const res = await api.get(`/qna/modules/${moduleId}/threads`);
  return unwrap(res);
}

// Certificates
export type CertificateItem = {
  id: string;
  title: string;
  courseTitle?: string | null;
  issuedAt?: string | null;
  pdfUrl?: string | null;
  previewUrl?: string | null;
  status?: 'verified' | 'pending' | string;
};

export type CertificatesStats = {
  totalEarned: number;
  latestAwardDate?: string | null;
  gpaEquivalent?: number | null;
  creditsValid?: number | null;
};

export type CertificatesResponse = {
  stats?: CertificatesStats;
  items: CertificateItem[];
};

export async function fetchMyCertificates(params?: { q?: string; page?: number }) {
  const res = await api.get('/me/certificates', { params });
  const data = unwrap<CertificatesResponse | CertificateItem[] | { items: CertificateItem[]; stats?: CertificatesStats }>(res);

  if (Array.isArray(data)) return { items: data, stats: undefined } as CertificatesResponse;

  const items = Array.isArray((data as any)?.items) ? (data as any).items : [];
  const stats = (data as any)?.stats;

  return { items, stats } as CertificatesResponse;
}

export async function downloadCertificatesBundle() {
  const res = await api.post('/me/certificates/bundle');
  return unwrap<{ url?: string }>(res);
}

export async function shareCertificates(payload: { certificateIds: string[] }) {
  const res = await api.post('/me/certificates/share', payload);
  return unwrap<{ url?: string }>(res);
}

// Settings
export type StudentSettings = {
  notificationsEmail?: boolean;
  notificationsSms?: boolean;
  announcements?: boolean;
  examReminders?: boolean;
  darkMode?: boolean;
};

export async function fetchMySettings() {
  const res = await api.get('/me/settings');
  return unwrap<StudentSettings>(res);
}

export async function updateMySettings(payload: Partial<StudentSettings>) {
  const res = await api.patch('/me/settings', payload);
  return unwrap<StudentSettings>(res);
}