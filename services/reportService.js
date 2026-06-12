/**
 * Report service layer.
 * Orchestrates student and attendance data to generate attendance reports.
 */

import * as ReportModel from '../models/Report.js';
import * as studentService from './studentService.js';
import * as attendanceService from './attendanceService.js';

/**
 * Get all reports.
 * @returns {Promise<Array>}
 */
export async function getAllReports() {
  return ReportModel.getAll();
}

/**
 * Get a report for a specific date.
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<object>}
 * @throws {Error} If no report exists for that date.
 */
export async function getReportByDate(date) {
  const report = ReportModel.getByDate(date);
  if (!report) {
    const error = new Error(`No report found for date ${date}`);
    error.status = 404;
    throw error;
  }
  return report;
}

/**
 * Generate (or regenerate) an attendance report for a given date.
 * Fetches all students and the day's attendance, computes statistics, and persists the report.
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<object>} The generated report.
 */
export async function generateReport(date, classSection = 'All') {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }

  let students = await studentService.getAllStudents();
  if (classSection && classSection !== 'All') {
    students = students.filter((s) => s.classSection === classSection);
  }

  const attendanceRecords = await attendanceService.getAttendanceByDate(date);

  const totalStudents = students.length;

  // Build a lookup map: studentId -> attendance record
  const attendanceMap = new Map();
  for (const record of attendanceRecords) {
    attendanceMap.set(Number(record.studentId), record);
  }

  // Build detailed records with student info merged in
  const records = students.map((student) => {
    const attRecord = attendanceMap.get(student.id);
    return {
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      classSection: student.classSection,
      status: attRecord ? attRecord.status : 'absent',
      markedAt: attRecord ? attRecord.markedAt : null,
    };
  });

  const presentCount = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentCount = totalStudents - presentCount;
  const percentage = totalStudents > 0
    ? Math.round((presentCount / totalStudents) * 10000) / 100
    : 0;

  const report = ReportModel.create({
    date,
    classSection,
    totalStudents,
    presentCount,
    absentCount,
    percentage,
    records,
  });

  return report;
}

/**
 * Delete a report by ID.
 * @param {number} id
 * @returns {Promise<boolean>}
 * @throws {Error} If report not found.
 */
export async function deleteReport(id) {
  const removed = ReportModel.remove(id);
  if (!removed) {
    const error = new Error(`Report with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}
