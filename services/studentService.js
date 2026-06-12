/**
 * Student service layer.
 * Provides validated, async wrappers around the Student model.
 */

import * as StudentModel from '../models/Student.js';

/**
 * Get all students.
 * @returns {Promise<Array>}
 */
export async function getAllStudents() {
  return StudentModel.getAll();
}

/**
 * Get a student by ID.
 * @param {number} id
 * @returns {Promise<object>}
 * @throws {Error} If student not found.
 */
export async function getStudentById(id) {
  const student = StudentModel.getById(id);
  if (!student) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return student;
}

/**
 * Create a new student with validation.
 * @param {object} data - { name, rollNumber, classSection }
 * @returns {Promise<object>}
 * @throws {Error} If required fields are missing.
 */
export async function createStudent(data) {
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
  });
}

/**
 * Update an existing student with validation.
 * @param {number} id
 * @param {object} data - Fields to update.
 * @returns {Promise<object>}
 * @throws {Error} If student not found or validation fails.
 */
export async function updateStudent(id, data) {
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

  const updated = StudentModel.update(id, {
    ...(data.name !== undefined && { name: data.name.trim() }),
    ...(data.rollNumber !== undefined && { rollNumber: data.rollNumber.toString().trim() }),
    ...(data.classSection !== undefined && { classSection: data.classSection.trim() }),
  });

  if (!updated) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return updated;
}

/**
 * Delete a student by ID.
 * @param {number} id
 * @returns {Promise<boolean>}
 * @throws {Error} If student not found.
 */
export async function deleteStudent(id) {
  const removed = StudentModel.remove(id);
  if (!removed) {
    const error = new Error(`Student with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}

/**
 * Search students by query string.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchStudents(query) {
  return StudentModel.search(query);
}
