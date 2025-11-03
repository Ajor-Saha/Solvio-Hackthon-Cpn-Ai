import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';

import ai_router from './routes/ai-route';
import user_router from './routes/auth-route';
import courseResource_router from './routes/course-resource-route';
import course_router from './routes/course-route';
import department_router from './routes/department-route';
import institution_router from './routes/institution-route';
import jobpost_router from './routes/jobsposting-routes';
import project_router from './routes/project-route';
import research_router from './routes/research-route';
import showcase_router from './routes/showcase-route';
import userManagement_router from './routes/user-management-route';

dotenv.config();

const app = express();

// Middleware to parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://study-flow.taskforges.com',
    ],
    credentials: true,
    maxAge: 86400,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

// Mount routers
app.use('/api/auth', user_router);

// Institution routes
app.use('/api/institution', institution_router);

// Department routes
app.use('/api/department', department_router);

// User management routes (for department admins)
app.use('/api/user-management', userManagement_router);

// Course routes
app.use('/api/course', course_router);

// Course resource routes
app.use('/api/course-resource', courseResource_router);

// Project routes
app.use('/api/project', project_router);

// Research routes
app.use('/api/research', research_router);

// Department Showcases routes
app.use('/api/showcases', showcase_router);

// Job Postings routes
app.use('/api/jobs', jobpost_router);

// AI Assistant routes
app.use('/api/ai', ai_router);

// Health check route
app.get('/', (req, res) => {
  res.send('Company & task server is running');
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('App error -> ', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// catch all the unknown routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:8000');
});
