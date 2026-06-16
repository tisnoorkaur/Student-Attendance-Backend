import * as classService from '../services/classService.js';

export async function getClasses(req, res) {
  try {
    const classes = await classService.getAllClasses(req.user);
    res.json({ success: true, data: classes });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function getClass(req, res) {
  try {
    const id = Number(req.params.id);
    const cls = await classService.getClassById(id, req.user);
    res.json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function createClass(req, res) {
  try {
    // School role cannot create classes
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot create classes' });
    }
    const cls = await classService.createClass(req.body, req.user);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function updateClass(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot modify classes' });
    }
    const id = Number(req.params.id);
    const cls = await classService.updateClass(id, req.body, req.user);
    res.json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function deleteClass(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot delete classes' });
    }
    const id = Number(req.params.id);
    await classService.deleteClass(id, req.user);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
