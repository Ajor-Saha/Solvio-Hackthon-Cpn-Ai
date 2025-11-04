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
import project_router from './routes/project-route';
import userManagement_router from './routes/user-management-route';

// New 5 announcement category routes
import achievementRouter from './routes/achievement-routes';
import competitionRouter from './routes/competition-routes';
import higherStudyRouter from './routes/higher-study-routes';
import jobRouter from './routes/job-routes';
import researchRouter from './routes/research-routes';
import debugRouter from './routes/debug-route';

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

// New 5 announcement category routes
app.use('/api/achievements', achievementRouter);
app.use('/api/competitions', competitionRouter);
app.use('/api/higher-studies', higherStudyRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/research', researchRouter);
// End announcement routes

// Debug route (remove in production)
app.use('/api/debug', debugRouter);

// AI Assistant routes
app.use('/api/ai', ai_router);

// (legacy competition routes removed in favor of announcement routes above)

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
