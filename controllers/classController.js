import * as classService from '../services/classService.js';

export async function getClasses(req, res) {
  try {
    const classes = await classService.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function getClass(req, res) {
  try {
    const id = Number(req.params.id);
    const cls = await classService.getClassById(id);
    res.json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function createClass(req, res) {
  try {
    const cls = await classService.createClass(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function updateClass(req, res) {
  try {
    const id = Number(req.params.id);
    const cls = await classService.updateClass(id, req.body);
    res.json({ success: true, data: cls });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function deleteClass(req, res) {
  try {
    const id = Number(req.params.id);
    await classService.deleteClass(id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
