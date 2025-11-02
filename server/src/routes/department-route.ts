import { Router } from 'express';
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByInstitution,
  updateDepartment,
} from '../controllers/department-controllers';

const department_router = Router();

// Create a new department
department_router.route('/create').post(createDepartment);

// Get all departments
department_router.route('/list').get(getAllDepartments);

// Get departments by institution
department_router
  .route('/by-institution/:institutionId')
  .get(getDepartmentsByInstitution);

// Get department by ID
department_router.route('/:departmentId').get(getDepartmentById);

// Update department
department_router.route('/update/:departmentId').put(updateDepartment);

// Delete department (soft delete)
department_router.route('/delete/:departmentId').delete(deleteDepartment);

export default department_router;
