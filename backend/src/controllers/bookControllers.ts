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
  SearchBookQuery 
} from "../schemas/bookSchema.js";
import { 
  AddBookSchema, 
  UpdateBookSchema, 
  SearchBookQuerySchema 
} from "../schemas/bookSchema.js";
import mongoose from "mongoose";

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
 * @returns {Promise<void>}
 */
const getBooks = async (
  req: Request<{}, {}, {}, { fanzine?: string; latestBook?: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Construir filtro dinámico
    const filter: Record<string, boolean> = {};
    
    if (req.query.fanzine !== undefined) {
      filter.fanzine = req.query.fanzine === "true";
    }
    if (req.query.latestBook !== undefined) {
      filter.latestBook = req.query.latestBook === "true";
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 }) // Más recientes primero
      .lean(); // Performance: objetos planos en lugar de documentos Mongoose

    res.status(200).json({
      success: true,
      message: books.length > 0 ? "Books retrieved successfully" : "No books found",
      data: books,
    });

  } catch (error) {
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
    // Validación con Zod
    const parseResult = SearchBookQuerySchema.safeParse(req.query);
    
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid search query",
        error: parseResult.error.issues.map(i => i.message),
      });
      return;
    }

    const { term } = parseResult.data;

    // Búsqueda con índice de texto (definido en bookModel.ts)
    const books = await Book.find(
      { $text: { $search: term } },
      { score: { $meta: "textScore" } } // Relevancia del match
    )
      .sort({ score: { $meta: "textScore" } }) // Ordenar por relevancia
      .limit(20) // Límite de resultados
      .lean();

    // Fallback: si no hay índice de texto o no encuentra, buscar con regex
    let results = books;
    if (books.length === 0) {
      const regex = new RegExp(term, "i"); // case-insensitive
      
      results = await Book.find({
        $or: [
          { title: regex },
          { firstName: regex },
          { lastName: regex },
          { editorial: regex },
          { isbn: term.toUpperCase() }, // Búsqueda exacta por ISBN
        ],
      })
        .limit(20)
        .lean();
    }

    res.status(200).json({
      success: true,
      message: results.length > 0 
        ? `Found ${results.length} book(s) matching "${term}"`
        : `No books found for "${term}"`,
      data: results,
    });

  } catch (error) {
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
    // Validación Zod
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

    // Verificar duplicado por ISBN (race condition handling)
    const existingBook = await Book.findOne({ isbn: bookData.isbn.toUpperCase() });
    
    if (existingBook) {
      res.status(409).json({
        success: false,
        message: `Book with ISBN ${bookData.isbn} already exists`,
      });
      return;
    }

    const newBook = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });


  } catch (error: unknown) {
    // Error de duplicado de MongoDB (índice único)
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
    // Validar ID de MongoDB
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
      return;
    }

    // Validación Zod (campos opcionales)
    const parseResult = UpdateBookSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid update data",
        error: parseResult.error.issues.map(i => i.message),
      });
      return;
    }

    const updateData = parseResult.data;

    // Verificar que hay datos para actualizar
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
      return;
    }

    // Si actualiza ISBN, verificar que no exista otro libro con ese ISBN
    if (updateData.isbn) {
      const existingBook = await Book.findOne({
        isbn: updateData.isbn.toUpperCase(),
        _id: { $ne: req.params.id }, // Excluir el libro actual
      });

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
        new: true, // Retornar documento actualizado
        runValidators: true, // Ejecutar validaciones del schema
      }
    );

    if (!updatedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
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
    // Validar ID
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

    res.status(200).json({
      success: true,
      message: `${deletedBook} deleted successfully`,
    });

    console.log(`[BOOK DELETED] ${deletedBook.title} (ID: ${deletedBook._id})`);

  } catch (error) {
    next(error);
  }
};

export { 
  getBooks, 
  searchBook, 
  addBook, 
  updateBook, 
  deleteBook 
};