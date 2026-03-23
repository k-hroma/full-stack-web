import { Router } from 'express';
import { addWriter } from '../controllers/writerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const writerRouter = Router();

writerRouter.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  addWriter
)

export { writerRouter }