import dotenv from 'dotenv'
dotenv.config({ override: true })
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import studentRoutes from './routes/studentRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import classRoutes from './routes/classRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { connectDB } from './config/db.js'

// Ensure MongoDB is connected before handling API requests
app.use('/api', async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    await connectDB()
    next()
  } catch (error) {
    next(error)
  }
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// ===== Middleware =====
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ===== Request logging =====
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// ===== API Routes =====
app.use('/api/students', studentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/classes', classRoutes)

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Class Attendance API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// ===== Serve Frontend (Production) =====
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist')
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('Class Attendance API is running. Frontend not built.')
  })
}

// ===== Error Handling =====
app.use(errorHandler)

// ===== Start Server =====
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║  🎓 Class Attendance API Server         ║
    ║  Running on: http://localhost:${PORT}       ║
    ║  Environment: ${process.env.NODE_ENV || 'development'}             ║
    ╚══════════════════════════════════════════╝
    `)
  })
}

export default app
