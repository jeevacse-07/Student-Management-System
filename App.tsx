import React, { useState, useEffect, useCallback } from 'react';
import { 
  Student, 
  StudentFormData, 
  DashboardStats, 
  ActiveTab, 
  ApiResponse 
} from './types';
import { Navbar } from './components/Navbar';
import { StudentList } from './components/StudentList';
import { StudentModal } from './components/StudentModal';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ApiTester } from './components/ApiTester';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { ArchitectureVivaView } from './components/ArchitectureVivaView';
import { SopRubricChecklist } from './components/SopRubricChecklist';
import { ProjectReportView } from './components/ProjectReportView';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink, 
  GraduationCap, 
  Heart,
  Globe
} from 'lucide-react';

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('crud');
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Students from REST API
  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json: ApiResponse<Student[]> = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        setServerStatus('online');
      }
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
      setServerStatus('offline');
      addToast('error', `API Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDept, selectedStatus, sortBy, sortOrder]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/students/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [fetchStudents, fetchStats]);

  // Handle Create Student (POST /api/students)
  const handleCreateStudent = async (formData: StudentFormData) => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Student> = await res.json();

      if (res.status === 201 && result.success) {
        addToast('success', `Student ${formData.firstName} ${formData.lastName} (${formData.rollNo}) successfully enrolled!`);
        await fetchStudents();
        await fetchStats();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.message || 'Failed to create student record',
          validationErrors: result.validationErrors 
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network request failed' };
    }
  };

  // Handle Update Student (PUT /api/students/:id)
  const handleUpdateStudent = async (formData: StudentFormData) => {
    if (!selectedStudent) return { success: false, error: 'No student selected for update' };

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Student> = await res.json();

      if (res.status === 200 && result.success) {
        addToast('success', `Student record for ${formData.rollNo} successfully updated!`);
        await fetchStudents();
        await fetchStats();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.message || 'Failed to update student record',
          validationErrors: result.validationErrors 
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network request failed' };
    }
  };

  // Handle Delete Student (DELETE /api/students/:id)
  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok && result.success) {
        addToast('info', `Student ${selectedStudent.firstName} ${selectedStudent.lastName} (${selectedStudent.rollNo}) deleted.`);
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
        await fetchStudents();
        await fetchStats();
      } else {
        addToast('error', result.message || 'Delete operation failed');
      }
    } catch (err: any) {
      addToast('error', `Error deleting record: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Database Seed (POST /api/students/seed)
  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/students/seed', {
        method: 'POST',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        addToast('success', `Database reset to default seed records (${result.count} students).`);
        await fetchStudents();
        await fetchStats();
      } else {
        addToast('error', 'Failed to seed database.');
      }
    } catch (err: any) {
      addToast('error', `Error resetting seed: ${err.message}`);
    }
  };

  // Open Handlers
  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const existingRolls = students.map((s) => s.rollNo.toUpperCase());

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl shadow-lg border text-xs font-medium flex items-start space-x-2.5 pointer-events-auto animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-700'
                : 'bg-stone-900 text-stone-50 border-stone-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-snug">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        onRefresh={() => {
          fetchStudents();
          fetchStats();
          addToast('info', 'Refreshed records from server API');
        }}
        totalStudents={students.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'crud' && (
          <StudentList
            students={students}
            stats={stats}
            loading={loading}
            onOpenCreate={handleOpenCreate}
            onOpenEdit={handleOpenEdit}
            onOpenView={handleOpenView}
            onOpenDelete={handleOpenDelete}
            onResetSeed={handleResetSeed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}

        {activeTab === 'api-tester' && (
          <ApiTester
            onRefreshData={() => {
              fetchStudents();
              fetchStats();
            }}
          />
        )}

        {activeTab === 'db-schema' && <DatabaseSchemaView />}

        {activeTab === 'architecture' && <ArchitectureVivaView />}

        {activeTab === 'rubric' && <SopRubricChecklist />}

        {activeTab === 'report' && <ProjectReportView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                E
              </div>
              <span className="font-semibold text-stone-800">EduCore • Standard Operating Procedure (SOP) CRUD Project</span>
              <span className="hidden sm:inline text-stone-300">|</span>
              <span className="hidden sm:inline">HTML • CSS • JS • React • REST API • Database</span>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="#report"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('report');
                }}
                className="hover:text-indigo-600 transition"
              >
                Project Report
              </a>
              <a
                href="#rubric"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('rubric');
                }}
                className="hover:text-indigo-600 transition"
              >
                Evaluation Rubric (100%)
              </a>
              <span className="text-stone-300">•</span>
              <span className="font-mono text-[11px] text-stone-400">
                Port 3000 • Live
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={formMode === 'create' ? handleCreateStudent : handleUpdateStudent}
        student={selectedStudent}
        mode={formMode}
        existingRolls={existingRolls}
      />

      <StudentDetailsModal
        isOpen={isViewModalOpen}
        student={selectedStudent}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        onEdit={(student) => {
          setIsViewModalOpen(false);
          handleOpenEdit(student);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        student={selectedStudent}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
