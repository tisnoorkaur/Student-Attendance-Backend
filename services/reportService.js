import * as ReportModel from '../models/Report.js';
import * as studentService from './studentService.js';
import * as attendanceService from './attendanceService.js';

export async function getAllReports(user) {
  return ReportModel.getAll(user);
}

export async function getReportByDate(date, user) {
  const report = await ReportModel.getByDate(date, user);
  if (!report) {
    const error = new Error(`No report found for date ${date}`);
    error.status = 404;
    throw error;
  }
  return report;
}

export async function generateReport(date, classSection = 'All', user) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const error = new Error('Valid date in YYYY-MM-DD format is required');
    error.status = 400;
    throw error;
  }

  let students = await studentService.getAllStudents(user);
  if (classSection && classSection !== 'All') {
    students = students.filter((s) => s.classSection === classSection);
  }

  const attendanceRecords = await attendanceService.getAttendanceByDate(date, user);

  const totalStudents = students.length;

  const attendanceMap = new Map();
  for (const record of attendanceRecords) {
    attendanceMap.set(Number(record.studentId), record);
  }

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

  const schoolId = user?.username || 'school1';

  const report = await ReportModel.create({
    date,
    classSection,
    totalStudents,
    presentCount,
    absentCount,
    percentage,
    records,
    schoolId,
  }, user);

  return report;
}

export async function deleteReport(id, user) {
  const removed = await ReportModel.remove(id, user);
  if (!removed) {
    const error = new Error(`Report with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}
