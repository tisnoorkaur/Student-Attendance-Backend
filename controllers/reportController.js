import * as reportService from '../services/reportService.js';

export async function getReports(req, res) {
  try {
    const reports = await reportService.getAllReports(req.user);
    res.json({ success: true, data: reports });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function getReport(req, res) {
  try {
    const { date } = req.params;
    const report = await reportService.getReportByDate(date, req.user);
    res.json({ success: true, data: report });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function generateReport(req, res) {
  try {
    const { date, classSection } = req.body;
    const report = await reportService.generateReport(date, classSection, req.user);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function deleteReport(req, res) {
  try {
    if (req.user && req.user.role === 'school') {
      return res.status(403).json({ success: false, message: 'Access Denied: Schools cannot delete reports' });
    }
    const id = Number(req.params.id);
    await reportService.deleteReport(id, req.user);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
