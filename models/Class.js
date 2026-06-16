import mongoose from 'mongoose';
import { getScopeFilter } from '../utils/scope.js';

const ClassSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  schoolId: { type: String, default: 'school1', index: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index scoped to school
ClassSchema.index({ name: 1, section: 1, schoolId: 1 }, { unique: true });

export const Class = mongoose.model('Class', ClassSchema);

/**
 * Get all classes from MongoDB as plain JS objects.
 */
export async function getAll(user) {
  const filter = getScopeFilter(user);
  return Class.find(filter).sort({ name: 1, section: 1 }).lean();
}

/**
 * Get a class by numeric ID as plain JS object.
 */
export async function getById(id, user) {
  const filter = getScopeFilter(user, { id: Number(id) });
  return Class.findOne(filter).lean();
}

/**
 * Find class by name and section combination as plain JS object.
 */
export async function getByClassAndSection(name, section, user) {
  const filter = getScopeFilter(user, {
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    section: { $regex: new RegExp(`^${section.trim()}$`, 'i') },
  });
  return Class.findOne(filter).lean();
}

/**
 * Create a new class with unique auto-incrementing ID.
 */
export async function create(data, user) {
  const maxClass = await Class.findOne().sort('-id');
  const nextId = (maxClass?.id || 0) + 1;

  const schoolId = user?.role === 'admin' && data.schoolId ? data.schoolId : (user?.username || 'school1');

  const newClass = new Class({
    id: nextId,
    name: data.name.trim(),
    section: data.section.trim(),
    schoolId,
  });

  await newClass.save();
  return newClass.toObject(); // Return as plain object
}

/**
 * Update an existing class.
 */
export async function update(id, data, user) {
  const filter = getScopeFilter(user, { id: Number(id) });
  const cls = await Class.findOne(filter);
  if (!cls) return null;

  const oldLabel = `${cls.name}-${cls.section}`;

  if (data.name !== undefined) cls.name = data.name.trim();
  if (data.section !== undefined) cls.section = data.section.trim();

  await cls.save();

  const newLabel = `${cls.name}-${cls.section}`;
  if (oldLabel !== newLabel) {
    const StudentModel = mongoose.model('Student');
    await StudentModel.updateMany({ classId: Number(id), schoolId: cls.schoolId }, { classSection: newLabel });
  }

  return cls.toObject();
}

/**
 * Remove a class and cascadingly delete associated student profiles and attendance records.
 */
export async function remove(id, user) {
  const filter = getScopeFilter(user, { id: Number(id) });
  const cls = await Class.findOne(filter);
  if (!cls) return false;

  const classSectionStr = `${cls.name}-${cls.section}`;

  const StudentModel = mongoose.model('Student');
  const AttendanceModel = mongoose.model('Attendance');

  const students = await StudentModel.find({ classSection: classSectionStr, schoolId: cls.schoolId });
  const studentIds = students.map((s) => s.id);

  if (studentIds.length > 0) {
    await AttendanceModel.deleteMany({ studentId: { $in: studentIds }, schoolId: cls.schoolId });
  }

  await StudentModel.deleteMany({ classSection: classSectionStr, schoolId: cls.schoolId });
  await Class.deleteOne({ id: Number(id) });
  return true;
}
