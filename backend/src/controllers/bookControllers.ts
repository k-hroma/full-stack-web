/**
 * @fileoverview Controladores para el dominio de libros.
 * Gestiona CRUD de catálogo editorial con búsqueda full-text.
 * @module controllers/bookControllers
 */

import type { Request, Response, NextFunction } from "express";
import { Book } from "../models/bookModel.js";
import type { QueryResponse } from "../types/queryResponse.js";
import type { 
  AddBookBody, 
  UpdateBookBody, 
} from "../schemas/bookSchema.js";
import { 
  AddBookSchema, 
  UpdateBookSchema, 
  SearchBookQuerySchema 
} from "../schemas/bookSchema.js";
import mongoose from "mongoose";
import type { IBook } from "../types/bookInterface.js";
import { escapeRegExp } from "../utils/escapeRegExp.js";

/**
 * Obtiene todos los libros del catálogo.
 * Soporta filtros opcionales por query params (fanzine, latestBook).
 * 
 * @function getBooks
 * @async
 * @route GET /books
 * @access Public
 * @query {boolean} [fanzine] - Filtrar solo fanzines
 * @query {boolean} [latestBook] - Filtrar solo novedades
 * @query {boolean} [showInHome] - Mostrar en Home
 * @returns {Promise<void>}
 */
const getBooks = async (
  req: Request<{}, {}, {}, { fanzine?: string; latestBook?: string; showInHome?: string;}>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, boolean> = {};
    
    if (req.query.fanzine !== undefined) {
      filter.fanzine = req.query.fanzine === "true";
    }
    if (req.query.latestBook !== undefined) {
      filter.latestBook = req.query.latestBook === "true";
    }
    if (req.query.showInHome !== undefined) {
      filter.showInHome = req.query.showInHome === "true";
    }
 
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .lean<IBook[]>();

    res.status(200).json({
      success: true,
      message: books.length > 0 ? "Books retrieved successfully" : "No books found",
      data: books,
    });
  } catch (error: unknown) {
    next(error);
  }
};

const getBookById = async (
  req: Request<{ id: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      const errMsg = "Invalid ID format.";
      res.status(400).json({
        success: false,
        message: errMsg
      });
      console.error(errMsg);
      return;
    }

    const book = await Book.findById(id).lean<IBook | null>();

    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book
    });
  } catch (error: unknown) { 
    next(error);
  }
};

/**
 * Búsqueda full-text en catálogo (título, autor, editorial).
 * 
 * @function searchBook
 * @async
 * @route GET /books/search?term=query
 * @access Public
 * @query {string} term - Término de búsqueda (mínimo 1 caracter)
 * @returns {Promise<void>}
 */
const searchBook = async (
  req: Request<{}, {}, {}, { term?: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = SearchBookQuerySchema.safeParse(req.query);
    
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid search query",
        error: { issues: parseResult.error.issues.map(i => i.message) },
      });
      return;
    }

    const { term } = parseResult.data;

    const books = await Book.find(
      { $text: { $search: term } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean<IBook[]>();

    let results = books;
    if (books.length === 0) {
      const regex = new RegExp(escapeRegExp(term), "i");
      
      results = await Book.find({
        $or: [
          { title: regex },
          { firstName: regex },
          { lastName: regex },
          { editorial: regex },
          { isbn: term.toUpperCase() },
        ],
      })
        .limit(20)
        .lean<IBook[]>();
    }

    res.status(200).json({
      success: true,
      message: results.length > 0 
        ? `Found ${results.length} book(s) matching "${term}"`
        : `No books found for "${term}"`,
      data: results,
    });
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Obtiene libros por nombre y apellido del autor.
 * 
 * @function getBooksByAuthor
 * @async
 * @route GET /books/author?lastName=X&firstName=Y
 * @access Public
 * @query {string} lastName - Apellido del autor (requerido)
 * @query {string} firstName - Nombre del autor (requerido)
 * @returns {Promise<void>}
 */
const getBooksByAuthor = async (
  req: Request<{}, {}, {}, { lastName?: string; firstName?: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { lastName, firstName } = req.query;

    // Validar que vengan ambos parámetros
    if (!lastName || !firstName) {
      res.status(400).json({
        success: false,
        message: "Both lastName and firstName are required",
      });
      return;
    }

    // Crear filtro case-insensitive usando regex
    const filter: Record<string, unknown> = {
      lastName: { $regex: new RegExp(escapeRegExp(lastName), "i") },
      firstName: { $regex: new RegExp(escapeRegExp(firstName), "i") },
    };

    const books = await Book.find(filter)
      .sort({ title: 1 }) // Ordenar por título ascendente
      .lean<IBook[]>();

    res.status(200).json({
      success: true,
      message: books.length > 0 
        ? `Found ${books.length} book(s) by ${firstName} ${lastName}`
        : `No books found by ${firstName} ${lastName}`,
      data: books,
    });
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Crea un nuevo libro en el catálogo.
 * Requiere rol admin.
 * 
 * @function addBook
 * @async
 * @route POST /books
 * @access Private (Admin)
 * @body {AddBookBody} - Datos del libro validados
 * @returns {Promise<void>}
 */
const addBook = async (
  req: Request<{}, {}, AddBookBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = AddBookSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map(i => i.message);
      
      res.status(400).json({
        success: false,
        message: "Invalid book data",
        error: { issues: messages },
      });
      return;
    }

    const bookData = parseResult.data;

    const existingBook = await Book
      .findOne({ isbn: bookData.isbn.toUpperCase() })
      .lean<IBook | null>();
    
    if (existingBook) {
      res.status(409).json({
        success: false,
        message: `Book with ISBN ${bookData.isbn} already exists`,
      });
      return;
    }

    const newBook = await Book.create(bookData);
    const bookDTO = newBook.toObject();

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: bookDTO,
    });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: "ISBN already exists in catalog",
      });
      return;
    }
    next(error);
  }
};

/**
 * Actualiza parcialmente un libro existente.
 * Requiere rol admin.
 * 
 * @function updateBook
 * @async
 * @route PATCH /books/:id
 * @access Private (Admin)
 * @param {string} id - MongoDB ObjectId del libro
 * @body {UpdateBookBody} - Campos a actualizar (parcial)
 * @returns {Promise<void>}
 */
const updateBook = async (
  req: Request<{ id: string }, {}, UpdateBookBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    const parseResult = UpdateBookSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid update data",
        error: { issues: parseResult.error.issues.map(i => i.message) },
      });
      return;
    }

    const updateData = parseResult.data;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
      return;
    }

    if (updateData.isbn) {
      const existingBook = await Book.findOne({
        isbn: updateData.isbn.toUpperCase(),
        _id: { $ne: req.params.id },
      }).lean<IBook | null>();

      if (existingBook) {
        res.status(409).json({
          success: false,
          message: `Another book with ISBN ${updateData.isbn} already exists`,
        });
        return;
      }

      updateData.isbn = updateData.isbn.toUpperCase();
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!updatedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    const bookDTO = updatedBook.toObject();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: bookDTO,
    });

    console.log(`[BOOK UPDATED] ${updatedBook.title}`);

  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: "ISBN conflict with existing book",
      });
      return;
    }
    next(error);
  }
};

/**
 * Elimina un libro del catálogo.
 * Requiere rol admin.
 * 
 * @function deleteBook
 * @async
 * @route DELETE /books/:id
 * @access Private (Admin)
 * @param {string} id - MongoDB ObjectId del libro
 * @returns {Promise<void>}
 */
const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    const deletedBookDTO = deletedBook.toObject();

    res.status(200).json({
      success: true,
      message: `${deletedBookDTO.title} deleted successfully`,
      data: deletedBookDTO,
    });

    console.log(`[BOOK DELETED] ${deletedBook.title} (ID: ${deletedBook._id})`);

  } catch (error: unknown) {
    next(error);
  }
};

export { 
  getBooks, 
  getBookById,
  getBooksByAuthor,
  searchBook, 
  addBook, 
  updateBook, 
  deleteBook 
};