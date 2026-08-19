import { Router, type IRouter } from 'express';
import { userController } from './user.controller';
import { validateBody } from '../../core/middleware/validate';
import { updateProfileSchema, changePasswordSchema, updateOnboardingProfileSchema } from './user.schema';
import { authenticate } from '../../core/middleware/auth';

const router: IRouter = Router();

// All profile routes require authentication
router.use(authenticate);

router.put('/update', validateBody(updateProfileSchema), userController.updateProfile);
router.post('/change-password', validateBody(changePasswordSchema), userController.changePassword);

// Onboarding routes
router.patch('/onboarding/profile', validateBody(updateOnboardingProfileSchema), userController.updateOnboardingProfile);
router.post('/onboarding/complete', userController.completeOnboarding);
router.get('/onboarding/status', userController.getOnboardingStatus);

export default router;

