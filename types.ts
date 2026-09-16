export interface Student {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  semester: number;
  cgpa: number;
  phone: string;
  status: 'Active' | 'On Leave' | 'Graduated' | 'Suspended';
  enrollmentDate: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  semester: number;
  cgpa: number;
  phone: string;
  status: 'Active' | 'On Leave' | 'Graduated' | 'Suspended';
  enrollmentDate: string;
  address: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  total?: number;
  data?: T;
  error?: string;
  validationErrors?: { field: string; message: string }[];
}

export interface DashboardStats {
  total: number;
  activeCount: number;
  graduatedCount: number;
  averageCgpa: number;
  departmentDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface ApiTestResult {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  statusText: string;
  durationMs: number;
  timestamp: string;
  requestBody?: any;
  responseBody: any;
  headers?: Record<string, string>;
  passed: boolean;
  testName: string;
}

export type ActiveTab = 
  | 'crud'
  | 'api-tester'
  | 'db-schema'
  | 'architecture'
  | 'rubric'
  | 'report';
