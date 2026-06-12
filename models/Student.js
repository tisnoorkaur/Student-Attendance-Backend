import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  classSection: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

StudentSchema.index({ classSection: 1, rollNumber: 1 }, { unique: true });

export const Student = mongoose.model('Student', StudentSchema);

/**
 * Get all students from MongoDB as plain JS objects.
 */
export async function getAll() {
  return Student.find().lean();
}

/**
 * Get student by numeric ID as plain JS object.
 */
export async function getById(id) {
  return Student.findOne({ id: Number(id) }).lean();
}

/**
 * Create a new student.
 */
export async function create(data) {
  const rollStr = data.rollNumber.toString().trim();
  const classStr = (data.classSection || '').trim();

  const duplicate = await Student.findOne({
    rollNumber: { $regex: new RegExp(`^${rollStr}$`, 'i') },
    classSection: { $regex: new RegExp(`^${classStr}$`, 'i') }
  });

  if (duplicate) {
    const error = new Error(`Roll number "${data.rollNumber}" already exists in Class "${data.classSection}"`);
    error.status = 400;
    throw error;
  }

  const maxStudent = await Student.findOne().sort('-id');
  const nextId = (maxStudent?.id || 0) + 1;

  const student = new Student({
    id: nextId,
    name: data.name.trim(),
    rollNumber: rollStr,
    classSection: classStr,
  });

  await student.save();
  return student.toObject();
}

/**
 * Update an existing student profile.
 */
export async function update(id, data) {
  const student = await Student.findOne({ id: Number(id) });
  if (!student) return null;

  const newRoll = data.rollNumber !== undefined ? data.rollNumber.toString().trim() : student.rollNumber;
  const newClass = data.classSection !== undefined ? data.classSection.trim() : student.classSection;

  if (newRoll.toLowerCase() !== student.rollNumber.toLowerCase() || newClass.toLowerCase() !== student.classSection.toLowerCase()) {
    const duplicate = await Student.findOne({
      id: { $ne: Number(id) },
      rollNumber: { $regex: new RegExp(`^${newRoll}$`, 'i') },
      classSection: { $regex: new RegExp(`^${newClass}$`, 'i') }
    });

    if (duplicate) {
      const error = new Error(`Roll number "${newRoll}" already exists in Class "${newClass}"`);
      error.status = 400;
      throw error;
    }
  }

  if (data.name !== undefined) student.name = data.name.trim();
  student.rollNumber = newRoll;
  student.classSection = newClass;

  await student.save();
  return student.toObject();
}

/**
 * Remove a student by ID and cascade delete their attendance logs.
 */
export async function remove(id) {
  const student = await Student.findOne({ id: Number(id) });
  if (!student) return false;

  const AttendanceModel = mongoose.model('Attendance');
  await AttendanceModel.deleteMany({ studentId: Number(id) });
  await Student.deleteOne({ id: Number(id) });
  return true;
}

/**
 * Search students.
 */
export async function search(query) {
  const q = query.toLowerCase().trim();
  if (!q) return getAll();

  return Student.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { rollNumber: { $regex: q, $options: 'i' } },
      { classSection: { $regex: q, $options: 'i' } }
    ]
  }).lean();
}
