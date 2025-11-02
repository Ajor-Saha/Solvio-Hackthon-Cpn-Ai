import { Router } from 'express';
import {
  createInstitution,
  deleteInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
} from '../controllers/institution-controllers';

const institution_router = Router();

// Create a new institution
institution_router.route('/create').post(createInstitution);

// Get all institutions
institution_router.route('/list').get(getAllInstitutions);

// Get institution by ID
institution_router.route('/:institutionId').get(getInstitutionById);

// Update institution
institution_router.route('/update/:institutionId').put(updateInstitution);

// Delete institution (soft delete)
institution_router.route('/delete/:institutionId').delete(deleteInstitution);

export default institution_router;
