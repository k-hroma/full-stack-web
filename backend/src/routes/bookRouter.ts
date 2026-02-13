import { Router } from "express";
import { getBooks, addBook, updateBook, deleteBook, searchBook } from "../controllers/bookControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";

const bookRouter = Router();

bookRouter.get("/", getBooks);
bookRouter.get("/search", searchBook);

bookRouter.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  addBook
);

bookRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  updateBook
);

bookRouter.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  deleteBook
);

export { bookRouter };
