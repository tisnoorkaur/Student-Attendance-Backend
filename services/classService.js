import * as ClassModel from '../models/Class.js';

export async function getAllClasses(user) {
  return ClassModel.getAll(user);
}

export async function getClassById(id, user) {
  const cls = await ClassModel.getById(id, user);
  if (!cls) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return cls;
}

export async function createClass(data, user) {
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
    schoolId: data.schoolId,
  }, user);
}

export async function updateClass(id, data, user) {
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

  const updated = await ClassModel.update(id, data, user);
  if (!updated) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return updated;
}

export async function deleteClass(id, user) {
  const removed = await ClassModel.remove(id, user);
  if (!removed) {
    const error = new Error(`Class with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return true;
}
