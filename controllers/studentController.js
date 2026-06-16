import * as studentService from '../services/studentService.js';

export async function getStudents(req, res) {
  try {
    const students = await studentService.getAllStudents(req.user);
    res.json({ success: true, data: students });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function getStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const student = await studentService.getStudentById(id, req.user);
    res.json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function createStudent(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot create students' });
    }
    const student = await studentService.createStudent(req.body, req.user);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function updateStudent(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot modify students' });
    }
    const id = Number(req.params.id);
    const student = await studentService.updateStudent(id, req.body, req.user);
    res.json({ success: true, data: student });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot delete students' });
    }
    const id = Number(req.params.id);
    await studentService.deleteStudent(id, req.user);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function searchStudents(req, res) {
  try {
    const query = req.query.q || '';
    const students = await studentService.searchStudents(query, req.user);
    res.json({ success: true, data: students });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
