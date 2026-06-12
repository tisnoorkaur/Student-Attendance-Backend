/**
 * Student controller.
 * Express request handlers for student CRUD and search endpoints.
 */

import * as studentService from '../services/studentService.js';

/**
 * GET / — List all students.
 */
export async function getStudents(req, res) {
  try {
    const students = await studentService.getAllStudents();
    res.json({ success: true, data: students });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /:id — Get a single student by ID.
 */
export async function getStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const student = await studentService.getStudentById(id);
    res.json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * POST / — Create a new student.
 */
export async function createStudent(req, res) {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * PUT /:id — Update an existing student.
 */
export async function updateStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const student = await studentService.updateStudent(id, req.body);
    res.json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /:id — Delete a student.
 */
export async function deleteStudent(req, res) {
  try {
    const id = Number(req.params.id);
    await studentService.deleteStudent(id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /search?q=query — Search students by name, roll number, or class section.
 */
export async function searchStudents(req, res) {
  try {
    const query = req.query.q || '';
    const students = await studentService.searchStudents(query);
    res.json({ success: true, data: students });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
