import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'students.json');

// Initial seed data representing real student records
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_001',
    rollNo: 'CS-2024-101',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@university.edu',
    department: 'Computer Science',
    semester: 6,
    cgpa: 9.15,
    phone: '+1 (555) 234-5678',
    status: 'Active',
    enrollmentDate: '2022-08-15',
    address: '422 Innovation Way, Tech Campus',
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-09-01T14:30:00.000Z',
  },
  {
    id: 'std_002',
    rollNo: 'CS-2024-102',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@university.edu',
    department: 'Computer Science',
    semester: 4,
    cgpa: 8.85,
    phone: '+1 (555) 345-6789',
    status: 'Active',
    enrollmentDate: '2023-08-20',
    address: '108 Lakeview Residency, North Hall',
    createdAt: '2024-01-12T10:15:00.000Z',
    updatedAt: '2024-08-25T11:00:00.000Z',
  },
  {
    id: 'std_003',
    rollNo: 'IT-2024-201',
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@university.edu',
    department: 'Information Technology',
    semester: 8,
    cgpa: 9.40,
    phone: '+1 (555) 456-7890',
    status: 'Active',
    enrollmentDate: '2021-08-10',
    address: '77 Silicon Square, Apt 4B',
    createdAt: '2024-01-15T11:20:00.000Z',
    updatedAt: '2024-09-10T16:45:00.000Z',
  },
  {
    id: 'std_004',
    rollNo: 'EC-2024-301',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@university.edu',
    department: 'Electronics & Comm',
    semester: 5,
    cgpa: 8.30,
    phone: '+1 (555) 567-8901',
    status: 'Active',
    enrollmentDate: '2022-08-18',
    address: '315 Blossom Garden Apt 12',
    createdAt: '2024-02-01T08:30:00.000Z',
    updatedAt: '2024-07-20T09:15:00.000Z',
  },
  {
    id: 'std_005',
    rollNo: 'AI-2024-401',
    firstName: 'Jordan',
    lastName: 'Taylor',
    email: 'jordan.taylor@university.edu',
    department: 'Data Science & AI',
    semester: 3,
    cgpa: 7.95,
    phone: '+1 (555) 678-9012',
    status: 'On Leave',
    enrollmentDate: '2023-08-25',
    address: '19 Pinecrest Blvd',
    createdAt: '2024-02-10T13:40:00.000Z',
    updatedAt: '2024-08-14T10:00:00.000Z',
  },
  {
    id: 'std_006',
    rollNo: 'ME-2024-501',
    firstName: 'Devon',
    lastName: 'Vance',
    email: 'devon.vance@university.edu',
    department: 'Mechanical Engineering',
    semester: 7,
    cgpa: 8.10,
    phone: '+1 (555) 789-0123',
    status: 'Active',
    enrollmentDate: '2021-08-12',
    address: '88 Gear Works Road',
    createdAt: '2024-02-15T15:10:00.000Z',
    updatedAt: '2024-08-30T17:20:00.000Z',
  },
  {
    id: 'std_007',
    rollNo: 'CS-2024-103',
    firstName: 'Sophia',
    lastName: 'Alvarez',
    email: 'sophia.alvarez@university.edu',
    department: 'Computer Science',
    semester: 8,
    cgpa: 9.80,
    phone: '+1 (555) 890-1234',
    status: 'Graduated',
    enrollmentDate: '2020-08-15',
    address: '502 Academic Quad, Suite 9',
    createdAt: '2024-02-20T10:00:00.000Z',
    updatedAt: '2024-06-15T12:00:00.000Z',
  },
  {
    id: 'std_008',
    rollNo: 'BA-2024-601',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    email: 'liam.oconnor@university.edu',
    department: 'Business Administration',
    semester: 2,
    cgpa: 7.60,
    phone: '+1 (555) 901-2345',
    status: 'Active',
    enrollmentDate: '2024-01-10',
    address: '22 River Park Drive',
    createdAt: '2024-03-01T11:00:00.000Z',
    updatedAt: '2024-08-12T14:10:00.000Z',
  }
];

// Helper to ensure database file exists
function loadStudents(): Student[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2));
      return [...INITIAL_STUDENTS];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading students DB, using in-memory defaults:', error);
    return [...INITIAL_STUDENTS];
  }
}

function saveStudents(students: Student[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(students, null, 2));
  } catch (error) {
    console.error('Error saving students DB:', error);
  }
}

// Server-side validation per SOP Section 9
interface ValidationError {
  field: string;
  message: string;
}

function validateStudentInput(
  data: Partial<Student>,
  existingStudents: Student[],
  currentId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Mandatory fields check
  if (!data.rollNo || typeof data.rollNo !== 'string' || !data.rollNo.trim()) {
    errors.push({ field: 'rollNo', message: 'Roll Number is required' });
  } else if (!/^[A-Z0-9_-]{3,20}$/i.test(data.rollNo.trim())) {
    errors.push({ field: 'rollNo', message: 'Roll Number must be alphanumeric (3-20 characters)' });
  }

  if (!data.firstName || typeof data.firstName !== 'string' || !data.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is mandatory' });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!data.lastName || typeof data.lastName !== 'string' || !data.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is mandatory' });
  }

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.push({ field: 'email', message: 'Email address is mandatory' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Invalid email format (e.g., student@domain.edu)' });
    }
  }

  if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
    errors.push({ field: 'department', message: 'Department selection is mandatory' });
  }

  if (data.semester === undefined || data.semester === null || isNaN(Number(data.semester))) {
    errors.push({ field: 'semester', message: 'Semester is mandatory' });
  } else {
    const sem = Number(data.semester);
    if (sem < 1 || sem > 8) {
      errors.push({ field: 'semester', message: 'Semester must be an integer between 1 and 8' });
    }
  }

  if (data.cgpa === undefined || data.cgpa === null || isNaN(Number(data.cgpa))) {
    errors.push({ field: 'cgpa', message: 'CGPA is mandatory' });
  } else {
    const gpa = Number(data.cgpa);
    if (gpa < 0 || gpa > 10) {
      errors.push({ field: 'cgpa', message: 'CGPA must be between 0.00 and 10.00' });
    }
  }

  // Duplicate unique check (Section 9: Duplicate unique values should be handled correctly)
  if (data.rollNo) {
    const cleanRoll = data.rollNo.trim().toUpperCase();
    const duplicateRoll = existingStudents.find(
      (s) => s.id !== currentId && s.rollNo.toUpperCase() === cleanRoll
    );
    if (duplicateRoll) {
      errors.push({
        field: 'rollNo',
        message: `Roll Number '${data.rollNo}' is already assigned to student ${duplicateRoll.firstName} ${duplicateRoll.lastName}`,
      });
    }
  }

  if (data.email) {
    const cleanEmail = data.email.trim().toLowerCase();
    const duplicateEmail = existingStudents.find(
      (s) => s.id !== currentId && s.email.toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      errors.push({
        field: 'email',
        message: `Email address '${data.email}' is already registered with another student record`,
      });
    }
  }

  return errors;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      sopCompliance: 'SOP-CRUD-2024 Compliant',
      database: 'Local File Database (JSON Storage Engine)',
    });
  });

  // REST API: READ ALL (with search, filter, sort) -> GET /api/students
  app.get('/api/students', (req: Request, res: Response) => {
    const students = loadStudents();
    const { search, department, status, sortBy, sortOrder } = req.query;

    let filtered = [...students];

    // Search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.rollNo.toLowerCase().includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (department && typeof department === 'string' && department !== 'All') {
      filtered = filtered.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }

    // Status filter
    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    // Sorting
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'cgpa') {
      filtered.sort((a, b) => (a.cgpa - b.cgpa) * order);
    } else if (sortBy === 'semester') {
      filtered.sort((a, b) => (a.semester - b.semester) * order);
    } else if (sortBy === 'rollNo') {
      filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo) * order);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.firstName.localeCompare(b.firstName) * order);
    } else {
      // Default sort by updatedAt desc
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      total: students.length,
      data: filtered,
    });
  });

  // REST API: STATS -> GET /api/students/stats
  app.get('/api/students/stats', (req: Request, res: Response) => {
    const students = loadStudents();
    const total = students.length;
    const activeCount = students.filter((s) => s.status === 'Active').length;
    const avgCgpa = total > 0 ? students.reduce((acc, s) => acc + s.cgpa, 0) / total : 0;

    const deptMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};

    students.forEach((s) => {
      deptMap[s.department] = (deptMap[s.department] || 0) + 1;
      statusMap[s.status] = (statusMap[s.status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      total,
      activeCount,
      graduatedCount: students.filter((s) => s.status === 'Graduated').length,
      averageCgpa: Number(avgCgpa.toFixed(2)),
      departmentDistribution: deptMap,
      statusDistribution: statusMap,
    });
  });

  // REST API: READ ONE -> GET /api/students/:id
  app.get('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const students = loadStudents();
    const student = students.find((s) => s.id === id || s.rollNo.toUpperCase() === id.toUpperCase());

    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Student record with identifier '${id}' was not found in the database.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  });

  // REST API: CREATE -> POST /api/students
  app.post('/api/students', (req: Request, res: Response) => {
    const students = loadStudents();
    const validationErrors = validateStudentInput(req.body, students);

    if (validationErrors.length > 0) {
      // If unique constraints failed, return 409 Conflict, else 400 Bad Request
      const hasConflict = validationErrors.some(
        (e) => e.message.includes('already assigned') || e.message.includes('already registered')
      );
      res.status(hasConflict ? 409 : 400).json({
        success: false,
        error: hasConflict ? 'Duplicate Resource Conflict' : 'Validation Error',
        validationErrors,
        message: validationErrors.map((e) => e.message).join('; '),
      });
      return;
    }

    const now = new Date().toISOString();
    const newStudent: Student = {
      id: `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      rollNo: req.body.rollNo.trim().toUpperCase(),
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim().toLowerCase(),
      department: req.body.department.trim(),
      semester: Number(req.body.semester),
      cgpa: Number(Number(req.body.cgpa).toFixed(2)),
      phone: req.body.phone ? req.body.phone.trim() : '+1 (555) 000-0000',
      status: req.body.status || 'Active',
      enrollmentDate: req.body.enrollmentDate || new Date().toISOString().split('T')[0],
      address: req.body.address ? req.body.address.trim() : 'Campus Residence Hall',
      createdAt: now,
      updatedAt: now,
    };

    students.unshift(newStudent);
    saveStudents(students);

    res.status(201).json({
      success: true,
      message: 'Student record successfully created.',
      data: newStudent,
    });
  });

  // REST API: UPDATE -> PUT /api/students/:id
  app.put('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const students = loadStudents();
    const index = students.findIndex((s) => s.id === id);

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Student record with ID '${id}' does not exist and cannot be updated.`,
      });
      return;
    }

    const validationErrors = validateStudentInput(req.body, students, id);
    if (validationErrors.length > 0) {
      const hasConflict = validationErrors.some(
        (e) => e.message.includes('already assigned') || e.message.includes('already registered')
      );
      res.status(hasConflict ? 409 : 400).json({
        success: false,
        error: hasConflict ? 'Duplicate Resource Conflict' : 'Validation Error',
        validationErrors,
        message: validationErrors.map((e) => e.message).join('; '),
      });
      return;
    }

    const existing = students[index];
    const updatedStudent: Student = {
      ...existing,
      rollNo: req.body.rollNo.trim().toUpperCase(),
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim().toLowerCase(),
      department: req.body.department.trim(),
      semester: Number(req.body.semester),
      cgpa: Number(Number(req.body.cgpa).toFixed(2)),
      phone: req.body.phone !== undefined ? req.body.phone.trim() : existing.phone,
      status: req.body.status || existing.status,
      enrollmentDate: req.body.enrollmentDate || existing.enrollmentDate,
      address: req.body.address !== undefined ? req.body.address.trim() : existing.address,
      updatedAt: new Date().toISOString(),
    };

    students[index] = updatedStudent;
    saveStudents(students);

    res.status(200).json({
      success: true,
      message: 'Student record successfully updated.',
      data: updatedStudent,
    });
  });

  // REST API: DELETE -> DELETE /api/students/:id
  app.delete('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const students = loadStudents();
    const index = students.findIndex((s) => s.id === id);

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Student record with ID '${id}' was not found. Deletion aborted.`,
      });
      return;
    }

    const removedStudent = students[index];
    students.splice(index, 1);
    saveStudents(students);

    res.status(200).json({
      success: true,
      message: `Student ${removedStudent.firstName} ${removedStudent.lastName} (${removedStudent.rollNo}) successfully deleted.`,
      deletedId: id,
      deletedRecord: removedStudent,
    });
  });

  // REST API: SEED/RESET -> POST /api/students/seed
  app.post('/api/students/seed', (req: Request, res: Response) => {
    saveStudents(INITIAL_STUDENTS);
    res.status(200).json({
      success: true,
      message: 'Database reset to default seed records successfully.',
      count: INITIAL_STUDENTS.length,
      data: INITIAL_STUDENTS,
    });
  });

  // REST API: SCHEMA METADATA -> GET /api/schema
  app.get('/api/schema', (req: Request, res: Response) => {
    res.json({
      entity: 'Student',
      table: 'students',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', constraints: 'PRIMARY KEY, NOT NULL' },
        { name: 'roll_no', type: 'VARCHAR(32)', constraints: 'UNIQUE, NOT NULL' },
        { name: 'first_name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'last_name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL' },
        { name: 'department', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'semester', type: 'INTEGER', constraints: 'NOT NULL, CHECK (semester BETWEEN 1 AND 8)' },
        { name: 'cgpa', type: 'DECIMAL(4,2)', constraints: 'NOT NULL, CHECK (cgpa >= 0.0 AND cgpa <= 10.0)' },
        { name: 'phone', type: 'VARCHAR(30)', constraints: 'NULL' },
        { name: 'status', type: 'VARCHAR(30)', constraints: "DEFAULT 'Active', CHECK (status IN ('Active', 'On Leave', 'Graduated', 'Suspended'))" },
        { name: 'enrollment_date', type: 'DATE', constraints: 'NOT NULL' },
        { name: 'address', type: 'TEXT', constraints: 'NULL' },
        { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduCore Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
