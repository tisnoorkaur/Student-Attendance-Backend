import * as attendanceService from '../services/attendanceService.js';

export async function getAttendance(req, res) {
  try {
    const { date } = req.query;
    let records;
    if (date) {
      records = await attendanceService.getAttendanceByDate(date, req.user);
    } else {
      records = await attendanceService.getAllAttendance(req.user);
    }
    res.json({ success: true, data: records });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function markAttendance(req, res) {
  try {
    const record = await attendanceService.markAttendance(req.body, req.user);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function bulkMarkAttendance(req, res) {
  try {
    const { records } = req.body;
    const results = await attendanceService.bulkMarkAttendance(records, req.user);
    res.status(201).json({ success: true, data: results });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function resetAttendance(req, res) {
  try {
    const { date } = req.query;
    const removedCount = await attendanceService.resetAttendance(date, req.user);
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

export async function getStudentHistory(req, res) {
  try {
    const studentId = Number(req.params.id);
    const records = await attendanceService.getStudentHistory(studentId, req.user);
    res.json({ success: true, data: records });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
