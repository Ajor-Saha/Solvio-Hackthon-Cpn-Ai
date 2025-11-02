import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';

import user_router from './routes/auth-route';
import courseResource_router from './routes/course-resource-route';
import course_router from './routes/course-route';
import department_router from './routes/department-route';
import institution_router from './routes/institution-route';
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
