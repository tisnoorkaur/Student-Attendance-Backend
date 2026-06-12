import * as ClassModel from '../models/Class.js';

export async function getAllClasses() {
  return ClassModel.getAll();
}

export async function getClassById(id) {
  const cls = ClassModel.getById(id);
  if (!cls) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return cls;
}

export async function createClass(data) {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Class name is required');
    error.status = 400;
    throw error;
  }
  if (!data.section || !data.section.trim()) {
    const error = new Error('Section is required');
    error.status = 400;
    throw error;
  }
  return ClassModel.create({
    name: data.name.trim(),
    section: data.section.trim(),
  });
}

export async function updateClass(id, data) {
  if (data.name !== undefined && !data.name.trim()) {
    const error = new Error('Class name cannot be empty');
    error.status = 400;
    throw error;
  }
  if (data.section !== undefined && !data.section.trim()) {
    const error = new Error('Section cannot be empty');
    error.status = 400;
    throw error;
  }

  const updated = ClassModel.update(id, data);
  if (!updated) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return updated;
}

export async function deleteClass(id) {
  const removed = ClassModel.remove(id);
  if (!removed) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}
