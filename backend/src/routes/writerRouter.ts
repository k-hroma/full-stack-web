import { Router } from 'express';
import { addWriter, deleteWriter, getWriterById, getWriters, searchWriter, updateWriter } from '../controllers/writerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const writerRouter = Router();

writerRouter.get("/", getWriters)
writerRouter.get("/search", searchWriter)
writerRouter.get("/:id", getWriterById)

writerRouter.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  addWriter
)

writerRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  updateWriter
);

writerRouter.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  deleteWriter
);

export { writerRouter }