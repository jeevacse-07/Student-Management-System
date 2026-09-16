const storageKey = 'studenthub-records';
const starterStudents = [
  { key: crypto.randomUUID(), name: 'Ananya Rao', studentId: 'STU-1042', email: 'ananya.rao@campus.edu', phone: '9876543210', department: 'Computer Science', year: '3' },
  { key: crypto.randomUUID(), name: 'Rohan Mehta', studentId: 'STU-1038', email: 'rohan.mehta@campus.edu', phone: '9876501234', department: 'Business Administration', year: '2' },
  { key: crypto.randomUUID(), name: 'Maya Iyer', studentId: 'STU-1019', email: 'maya.iyer@campus.edu', phone: '9123456780', department: 'Design & Media', year: '4' }
];
let students = JSON.parse(localStorage.getItem(storageKey) || 'null') || starterStudents;
let editingKey = null;
const $ = (id) => document.getElementById(id);
const form = $('studentForm');

function saveRecords() { localStorage.setItem(storageKey, JSON.stringify(students)); }
function initials(name) { return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(); }
function render() {
  const query = $('searchInput').value.trim().toLowerCase();
  const department = $('departmentFilter').value;
  const year = $('yearFilter').value;
  const filtered = students.filter((student) => {
    const searchable = `${student.name} ${student.email} ${student.studentId}`.toLowerCase();
    return searchable.includes(query) && (!department || student.department === department) && (!year || student.year === year);
  });
  $('studentTableBody').innerHTML = filtered.map((student) => `<tr><td><div class="student-cell"><span class="avatar">${initials(student.name)}</span><div><div class="student-name">${escapeHtml(student.name)}</div><div class="student-email">${escapeHtml(student.email)}</div></div></div></td><td>${escapeHtml(student.studentId)}</td><td>${escapeHtml(student.department)}</td><td>Year ${student.year}</td><td><span class="badge">Active</span></td><td class="action-cell"><button class="icon-button" data-action="edit" data-key="${student.key}" aria-label="Edit ${escapeHtml(student.name)}">✎</button><button class="icon-button" data-action="delete" data-key="${student.key}" aria-label="Delete ${escapeHtml(student.name)}">⌫</button></td></tr>`).join('');
  $('emptyState').style.display = filtered.length ? 'none' : 'block';
  $('recordCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'record' : 'records'}`;
  $('totalStudents').textContent = students.length;
  $('activeStudents').textContent = students.length;
  $('departmentCount').textContent = new Set(students.map((student) => student.department)).size;
  $('averageYear').textContent = students.length ? (students.reduce((sum, student) => sum + Number(student.year), 0) / students.length).toFixed(1) : '0.0';
  updateDepartmentFilter();
}
function updateDepartmentFilter() {
  const current = $('departmentFilter').value;
  const departments = [...new Set(students.map((student) => student.department))].sort();
  $('departmentFilter').innerHTML = '<option value="">All departments</option>' + departments.map((department) => `<option>${escapeHtml(department)}</option>`).join('');
  $('departmentFilter').value = departments.includes(current) ? current : '';
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function openModal(student = null) {
  editingKey = student?.key || null;
  $('modalTitle').textContent = student ? 'Edit student' : 'Add a student';
  $('studentKey').value = editingKey || '';
  ['name', 'studentId', 'email', 'phone', 'department', 'year'].forEach((field) => { $(field === 'studentId' ? 'studentId' : `student${field[0].toUpperCase()}${field.slice(1)}`).value = student?.[field] || ''; });
  clearErrors();
  $('modalBackdrop').hidden = false;
  $('studentName').focus();
}
function closeModal() { $('modalBackdrop').hidden = true; form.reset(); clearErrors(); editingKey = null; }
function clearErrors() { document.querySelectorAll('.error-message').forEach((element) => { element.textContent = ''; }); }
function validate(data) {
  clearErrors();
  const errors = {};
  if (data.name.length < 2) errors.name = 'Enter the student name.';
  if (!/^STU-\d{4}$/i.test(data.studentId)) errors.studentId = 'Use format STU-0000.';
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Enter a valid email.';
  if (!/^\d{10}$/.test(data.phone)) errors.phone = 'Enter a 10-digit phone number.';
  if (!data.department) errors.department = 'Select a department.';
  if (!data.year) errors.year = 'Select an academic year.';
  if (students.some((student) => student.studentId.toLowerCase() === data.studentId.toLowerCase() && student.key !== editingKey)) errors.studentId = 'This ID already exists.';
  Object.entries(errors).forEach(([field, message]) => { document.querySelector(`[data-error="${field}"]`).textContent = message; });
  return Object.keys(errors).length === 0;
}
function showToast(message) { const toast = $('toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!validate(data)) return;
  const wasEditing = Boolean(editingKey);
  if (wasEditing) students = students.map((student) => student.key === editingKey ? { ...student, ...data } : student);
  else students.unshift({ ...data, key: crypto.randomUUID() });
  saveRecords(); render(); closeModal(); showToast(wasEditing ? 'Student record updated.' : 'Student added successfully.');
});
$('studentTableBody').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const student = students.find((record) => record.key === button.dataset.key);
  if (button.dataset.action === 'edit') openModal(student);
  if (button.dataset.action === 'delete' && confirm(`Delete ${student.name}'s record?`)) { students = students.filter((record) => record.key !== student.key); saveRecords(); render(); showToast('Student record deleted.'); }
});
$('addStudentButton').addEventListener('click', () => openModal());
$('emptyAddButton').addEventListener('click', () => openModal());
$('closeModal').addEventListener('click', closeModal);
$('cancelButton').addEventListener('click', closeModal);
$('modalBackdrop').addEventListener('click', (event) => { if (event.target === $('modalBackdrop')) closeModal(); });
$('searchInput').addEventListener('input', render);
$('departmentFilter').addEventListener('change', render);
$('yearFilter').addEventListener('change', render);
render();
