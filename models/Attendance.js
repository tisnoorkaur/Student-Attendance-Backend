import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  studentId: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  markedAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', AttendanceSchema);

/**
 * Get all attendance records for a specific date as plain JS objects.
 */
export async function getByDate(date) {
  return Attendance.find({ date }).lean();
}

/**
 * Get all attendance records across all dates.
 */
export async function getAll() {
  return Attendance.find({}).lean();
}

/**
 * Mark attendance for a single student on a given date (upsert).
 */
export async function markAttendance(data) {
  const studentId = Number(data.studentId);
  const existing = await Attendance.findOne({ studentId, date: data.date });

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
    markedAt: new Date().toISOString(),
  });

  await record.save();
  return record.toObject();
}

/**
 * Mark attendance for multiple students at once (upsert each).
 */
export async function bulkMark(records) {
  const results = [];
  
  for (const recordData of records) {
    const studentId = Number(recordData.studentId);
    const existing = await Attendance.findOne({ studentId, date: recordData.date });

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
export async function resetByDate(date) {
  const result = await Attendance.deleteMany({ date });
  return result.deletedCount;
}

/**
 * Get all attendance records for a specific student, sorted by date descending.
 */
export async function getByStudent(studentId) {
  return Attendance.find({ studentId: Number(studentId) }).sort({ date: -1 }).lean();
}
