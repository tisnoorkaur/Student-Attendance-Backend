import * as StudentModel from '../models/Student.js';

export async function getAllStudents(user) {
  return StudentModel.getAll(user);
}

export async function getStudentById(id, user) {
  const student = await StudentModel.getById(id, user);
  if (!student) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return student;
}

export async function createStudent(data, user) {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }
  if (!data.rollNumber || !data.rollNumber.toString().trim()) {
    const error = new Error('Roll number is required');
    error.status = 400;
    throw error;
  }
  return StudentModel.create({
    name: data.name.trim(),
    rollNumber: data.rollNumber.toString().trim(),
    classSection: data.classSection ? data.classSection.trim() : '',
    schoolId: data.schoolId,
  }, user);
}

export async function updateStudent(id, data, user) {
  if (data.name !== undefined && !data.name.trim()) {
    const error = new Error('Name cannot be empty');
    error.status = 400;
    throw error;
  }
  if (data.rollNumber !== undefined && !data.rollNumber.toString().trim()) {
    const error = new Error('Roll number cannot be empty');
    error.status = 400;
    throw error;
  }

  const updated = await StudentModel.update(id, {
    ...(data.name !== undefined && { name: data.name.trim() }),
    ...(data.rollNumber !== undefined && { rollNumber: data.rollNumber.toString().trim() }),
    ...(data.classSection !== undefined && { classSection: data.classSection.trim() }),
  }, user);

  if (!updated) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return updated;
}

export async function deleteStudent(id, user) {
  const removed = await StudentModel.remove(id, user);
  if (!removed) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}

export async function searchStudents(query, user) {
  return StudentModel.search(query, user);
}
