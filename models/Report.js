import mongoose from 'mongoose';
import { getScopeFilter } from '../utils/scope.js';

const ReportSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  date: { type: String, required: true },
  classSection: { type: String, required: true, default: 'All' },
  totalStudents: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  records: { type: Array, default: [] },
  schoolId: { type: String, default: 'school1', index: true },
  generatedAt: { type: Date, default: Date.now },
});

ReportSchema.index({ date: 1, classSection: 1, schoolId: 1 }, { unique: true });

export const Report = mongoose.model('Report', ReportSchema);

/**
 * Get all reports from MongoDB, sorted by generatedAt descending.
 */
export async function getAll(user) {
  const filter = getScopeFilter(user);
  return Report.find(filter).sort({ generatedAt: -1 }).lean();
}

/**
 * Get a report for a specific date and class.
 */
export async function getByDateAndClass(date, classSection, user) {
  const filter = getScopeFilter(user, { date, classSection: classSection || 'All' });
  return Report.findOne(filter).lean();
}

/**
 * Get report by date.
 */
export async function getByDate(date, user) {
  const filter = getScopeFilter(user, { date });
  return Report.findOne(filter).lean();
}

/**
 * Create or replace a report.
 */
export async function create(data, user) {
  const date = data.date;
  const classSection = data.classSection || 'All';
  const schoolId = user?.role === 'admin' && data.schoolId ? data.schoolId : (user?.username || 'school1');

  await Report.deleteOne({ date, classSection, schoolId });

  const maxReport = await Report.findOne().sort('-id');
  const nextId = (maxReport?.id || 0) + 1;

  const report = new Report({
    id: nextId,
    date,
    classSection,
    totalStudents: data.totalStudents,
    presentCount: data.presentCount,
    absentCount: data.absentCount,
    percentage: data.percentage,
    records: data.records || [],
    schoolId,
    generatedAt: new Date().toISOString(),
  });

  await report.save();
  return report.toObject();
}

/**
 * Remove a report by ID.
 */
export async function remove(id, user) {
  const filter = getScopeFilter(user, { id: Number(id) });
  const result = await Report.deleteOne(filter);
  return result.deletedCount > 0;
}
