/**
 * Report controller.
 * Express request handlers for generating and managing attendance reports.
 */

import * as reportService from '../services/reportService.js';

/**
 * GET / — Get all reports.
 */
export async function getReports(req, res) {
  try {
    const reports = await reportService.getAllReports();
    res.json({ success: true, data: reports });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /:date — Get a report for a specific date.
 */
export async function getReport(req, res) {
  try {
    const { date } = req.params;
    const report = await reportService.getReportByDate(date);
    res.json({ success: true, data: report });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * POST /generate — Generate a new report for a date.
 * Body: { date: "YYYY-MM-DD" }
 */
export async function generateReport(req, res) {
  try {
    const { date, classSection } = req.body;
    const report = await reportService.generateReport(date, classSection);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /:id — Delete a report by ID.
 */
export async function deleteReport(req, res) {
  try {
    const id = Number(req.params.id);
    await reportService.deleteReport(id);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
