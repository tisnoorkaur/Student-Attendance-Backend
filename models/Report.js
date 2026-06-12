import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  date: { type: String, required: true },
  classSection: { type: String, required: true, default: 'All' },
  totalStudents: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  records: { type: Array, default: [] },
  generatedAt: { type: Date, default: Date.now },
});

ReportSchema.index({ date: 1, classSection: 1 }, { unique: true });

export const Report = mongoose.model('Report', ReportSchema);

/**
 * Get all reports from MongoDB, sorted by generatedAt descending.
 */
export async function getAll() {
  return Report.find().sort({ generatedAt: -1 }).lean();
}

/**
 * Get a report for a specific date and class.
 */
export async function getByDateAndClass(date, classSection) {
  return Report.findOne({ date, classSection: classSection || 'All' }).lean();
}

/**
 * Get report by date.
 */
export async function getByDate(date) {
  return Report.findOne({ date }).lean();
}

/**
 * Create or replace a report.
 */
export async function create(data) {
  const date = data.date;
  const classSection = data.classSection || 'All';

  await Report.deleteOne({ date, classSection });

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
    generatedAt: new Date().toISOString(),
  });

  await report.save();
  return report.toObject();
}

/**
 * Remove a report by ID.
 */
export async function remove(id) {
  const result = await Report.deleteOne({ id: Number(id) });
  return result.deletedCount > 0;
}
