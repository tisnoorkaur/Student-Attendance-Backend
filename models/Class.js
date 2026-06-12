import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

ClassSchema.index({ name: 1, section: 1 }, { unique: true });

export const Class = mongoose.model('Class', ClassSchema);

/**
 * Get all classes from MongoDB as plain JS objects.
 */
export async function getAll() {
  return Class.find().sort({ name: 1, section: 1 }).lean();
}

/**
 * Get a class by numeric ID as plain JS object.
 */
export async function getById(id) {
  return Class.findOne({ id: Number(id) }).lean();
}

/**
 * Find class by name and section combination as plain JS object.
 */
export async function getByClassAndSection(name, section) {
  return Class.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    section: { $regex: new RegExp(`^${section.trim()}$`, 'i') },
  }).lean();
}

/**
 * Create a new class with unique auto-incrementing ID.
 */
export async function create(data) {
  const maxClass = await Class.findOne().sort('-id');
  const nextId = (maxClass?.id || 0) + 1;

  const newClass = new Class({
    id: nextId,
    name: data.name.trim(),
    section: data.section.trim(),
  });

  await newClass.save();
  return newClass.toObject(); // Return as plain object
}

/**
 * Update an existing class.
 */
export async function update(id, data) {
  const cls = await Class.findOne({ id: Number(id) });
  if (!cls) return null;

  const oldLabel = `${cls.name}-${cls.section}`;

  if (data.name !== undefined) cls.name = data.name.trim();
  if (data.section !== undefined) cls.section = data.section.trim();

  await cls.save();

  const newLabel = `${cls.name}-${cls.section}`;
  if (oldLabel !== newLabel) {
    const StudentModel = mongoose.model('Student');
    await StudentModel.updateMany({ classId: Number(id) }, { classSection: newLabel });
  }

  return cls.toObject();
}

/**
 * Remove a class and cascadingly delete associated student profiles and attendance records.
 */
export async function remove(id) {
  const cls = await Class.findOne({ id: Number(id) });
  if (!cls) return false;

  const classSectionStr = `${cls.name}-${cls.section}`;

  const StudentModel = mongoose.model('Student');
  const AttendanceModel = mongoose.model('Attendance');

  const students = await StudentModel.find({ classSection: classSectionStr });
  const studentIds = students.map((s) => s.id);

  if (studentIds.length > 0) {
    await AttendanceModel.deleteMany({ studentId: { $in: studentIds } });
  }

  await StudentModel.deleteMany({ classSection: classSectionStr });
  await Class.deleteOne({ id: Number(id) });
  return true;
}
