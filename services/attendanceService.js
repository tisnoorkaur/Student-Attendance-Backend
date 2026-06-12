/**
 * Attendance service layer.
 * Provides validated, async wrappers around the Attendance model.
 */

import * as AttendanceModel from '../models/Attendance.js';

/** Simple YYYY-MM-DD date format validator. */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
}

/** Allowed attendance status values. */
const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];

/**
 * Get all attendance records across all dates.
 * @returns {Promise<Array>}
 */
export async function getAllAttendance() {
  return AttendanceModel.getAll();
}

/**
 * Get attendance records for a given date.
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>}
 * @throws {Error} If date is invalid.
 */
export async function getAttendanceByDate(date) {
  if (!isValidDate(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.getByDate(date);
}

/**
 * Mark attendance for a single student.
 * @param {object} data - { studentId, date, status }
 * @returns {Promise<object>}
 * @throws {Error} If validation fails.
 */
export async function markAttendance(data) {
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
  });
}

/**
 * Bulk mark attendance for multiple students.
 * @param {Array<{studentId: number, date: string, status: string}>} records
 * @returns {Promise<Array>}
 * @throws {Error} If records is not a non-empty array or individual records fail validation.
 */
export async function bulkMarkAttendance(records) {
  if (!Array.isArray(records) || records.length === 0) {
    const error = new Error('Records must be a non-empty array');
    error.status = 400;
    throw error;
  }

  // Validate every record before writing any
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
  }));

  return AttendanceModel.bulkMark(normalized);
}

/**
 * Reset (delete) all attendance records for a date.
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<number>} Number of records removed.
 * @throws {Error} If date is invalid.
 */
export async function resetAttendance(date) {
  if (!isValidDate(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.resetByDate(date);
}

/**
 * Get attendance history for a specific student.
 * @param {number} studentId
 * @returns {Promise<Array>}
 */
export async function getStudentHistory(studentId) {
  if (!studentId) {
    const error = new Error('studentId is required');
    error.status = 400;
    throw error;
  }
  return AttendanceModel.getByStudent(Number(studentId));
}
