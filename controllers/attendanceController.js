/**
 * Attendance controller.
 * Express request handlers for attendance marking and querying.
 */

import * as attendanceService from '../services/attendanceService.js';

/**
 * GET /?date=YYYY-MM-DD — Get attendance records for a date, or all if date omitted.
 */
export async function getAttendance(req, res) {
  try {
    const { date } = req.query;
    let records;
    if (date) {
      records = await attendanceService.getAttendanceByDate(date);
    } else {
      records = await attendanceService.getAllAttendance();
    }
    res.json({ success: true, data: records });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * POST / — Mark attendance for a single student.
 * Body: { studentId, date, status }
 */
export async function markAttendance(req, res) {
  try {
    const record = await attendanceService.markAttendance(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * POST /bulk — Mark attendance for multiple students at once.
 * Body: { records: [{ studentId, date, status }, ...] }
 */
export async function bulkMarkAttendance(req, res) {
  try {
    const { records } = req.body;
    const results = await attendanceService.bulkMarkAttendance(records);
    res.status(201).json({ success: true, data: results });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /?date=YYYY-MM-DD — Reset (delete) all attendance for a date.
 */
export async function resetAttendance(req, res) {
  try {
    const { date } = req.query;
    const removedCount = await attendanceService.resetAttendance(date);
    res.json({
      success: true,
      message: `Removed ${removedCount} attendance record(s) for ${date}`,
      data: { removedCount },
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /student/:id — Get full attendance history for a student.
 */
export async function getStudentHistory(req, res) {
  try {
    const studentId = Number(req.params.id);
    const records = await attendanceService.getStudentHistory(studentId);
    res.json({ success: true, data: records });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
