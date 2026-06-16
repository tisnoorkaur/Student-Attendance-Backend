import mongoose from 'mongoose';
import { getScopeFilter } from '../utils/scope.js';

const AttendanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  studentId: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  schoolId: { type: String, default: 'school1', index: true },
  markedAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ date: 1, studentId: 1, schoolId: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', AttendanceSchema);

/**
 * Get all attendance records for a specific date as plain JS objects.
 */
export async function getByDate(date, user) {
  const filter = getScopeFilter(user, { date });
  return Attendance.find(filter).lean();
}

/**
 * Get all attendance records across all dates.
 */
export async function getAll(user) {
  const filter = getScopeFilter(user);
  return Attendance.find(filter).lean();
}

/**
 * Mark attendance for a single student on a given date (upsert).
 */
export async function markAttendance(data, user) {
  const studentId = Number(data.studentId);
  const schoolId = user?.role === 'admin' && data.schoolId ? data.schoolId : (user?.username || 'school1');
  const existing = await Attendance.findOne({ studentId, date: data.date, schoolId });

  if (existing) {
    existing.status = data.status;
    existing.markedAt = new Date().toISOString();
    await existing.save();
    return existing.toObject();
  }

  const maxRecord = await Attendance.findOne().sort('-id');
  const nextId = (maxRecord?.id || 0) + 1;

  const record = new Attendance({
    id: nextId,
    studentId,
    date: data.date,
    status: data.status,
    schoolId,
    markedAt: new Date().toISOString(),
  });

  await record.save();
  return record.toObject();
}

/**
 * Mark attendance for multiple students at once (upsert each).
 */
export async function bulkMark(records, user) {
  const results = [];
  const schoolId = user?.username || 'school1';
  
  for (const recordData of records) {
    const studentId = Number(recordData.studentId);
    const recordSchoolId = user?.role === 'admin' && recordData.schoolId ? recordData.schoolId : schoolId;
    const existing = await Attendance.findOne({ studentId, date: recordData.date, schoolId: recordSchoolId });

    if (existing) {
      existing.status = recordData.status;
      existing.markedAt = new Date().toISOString();
      await existing.save();
      results.push(existing.toObject());
    } else {
      const maxRecord = await Attendance.findOne().sort('-id');
      const nextId = (maxRecord?.id || 0) + 1;

      const newRecord = new Attendance({
        id: nextId,
        studentId,
        date: recordData.date,
        status: recordData.status,
        schoolId: recordSchoolId,
        markedAt: new Date().toISOString(),
      });
      await newRecord.save();
      results.push(newRecord.toObject());
    }
  }

  return results;
}

/**
 * Remove all attendance records for a specific date.
 */
export async function resetByDate(date, user) {
  const filter = getScopeFilter(user, { date });
  const result = await Attendance.deleteMany(filter);
  return result.deletedCount;
}

/**
 * Get all attendance records for a specific student, sorted by date descending.
 */
export async function getByStudent(studentId, user) {
  const filter = getScopeFilter(user, { studentId: Number(studentId) });
  return Attendance.find(filter).sort({ date: -1 }).lean();
}
