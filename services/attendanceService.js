import * as AttendanceModel from '../models/Attendance.js';

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
}

const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];

export async function getAllAttendance(user) {
  return AttendanceModel.getAll(user);
}

export async function getAttendanceByDate(date, user) {
  if (!isValidDate(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.getByDate(date, user);
}

export async function markAttendance(data, user) {
  if (!data.studentId) {
    const error = new Error('studentId is required');
    error.status = 400;
    throw error;
  }
  if (!isValidDate(data.date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }
  if (!data.status || !VALID_STATUSES.includes(data.status.toLowerCase())) {
    const error = new Error(
      `Status must be one of: ${VALID_STATUSES.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  return AttendanceModel.markAttendance({
    studentId: Number(data.studentId),
    date: data.date,
    status: data.status.toLowerCase(),
    schoolId: data.schoolId,
  }, user);
}

export async function bulkMarkAttendance(records, user) {
  if (!Array.isArray(records) || records.length === 0) {
    const error = new Error('Records must be a non-empty array');
    error.status = 400;
    throw error;
  }

  for (const [i, record] of records.entries()) {
    if (!record.studentId) {
      const error = new Error(`Record ${i}: studentId is required`);
      error.status = 400;
      throw error;
    }
    if (!isValidDate(record.date)) {
      const error = new Error(`Record ${i}: valid date in YYYY-MM-DD format is required`);
      error.status = 400;
      throw error;
    }
    if (!record.status || !VALID_STATUSES.includes(record.status.toLowerCase())) {
      const error = new Error(
        `Record ${i}: status must be one of: ${VALID_STATUSES.join(', ')}`
      );
      error.status = 400;
      throw error;
    }
  }

  const normalized = records.map((r) => ({
    studentId: Number(r.studentId),
    date: r.date,
    status: r.status.toLowerCase(),
    schoolId: r.schoolId,
  }));

  return AttendanceModel.bulkMark(normalized, user);
}

export async function resetAttendance(date, user) {
  if (!isValidDate(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.resetByDate(date, user);
}

export async function getStudentHistory(studentId, user) {
  if (!studentId) {
    const error = new Error('studentId is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.getByStudent(Number(studentId), user);
}
