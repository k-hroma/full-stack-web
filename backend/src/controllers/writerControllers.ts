import type { Request, Response, NextFunction } from "express";
import { Writer } from "../models/writerModel.js";
import type { QueryResponse } from "../types/queryResponse.js";
import type { AddWriterBody, UpdateWriterBody } from "../schemas/writerSchema.js";
import { AddWriterSchema, SearchWriterQuerySchema, UpdateWriterSchema } from "../schemas/writerSchema.js";
import mongoose from 'mongoose';
import type { IWriter } from "../types/writerInterface.js";
import { escapeRegExp } from "../utils/escapeRegExp.js";

const getWriters = async (
  req: Request<{}, {}, {}, {recomended?: string}>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, boolean> = {};
    if (req.query.recomended !== undefined) {
      filter.recomended = req.query.recomended === "true";
    }
    const writers = await Writer.find(filter)
      .sort({ createdAt: -1 })
      .lean<IWriter[]>();
    
    
    res.status(200).json({
      success: true,
      message: writers.length > 0 ? "Writers retrieved successfully" : "No writers found",
      data: writers,
    });
    
  } catch (error: unknown) {
    next(error)
    
  }
 }

/**
 * Obtiene un escritor específico por su ID.
 * 
 * @async
 * @function getWriterById
 * @route GET /writers/:id
 * @param {Request} req - Request con el ID del escritor en params
 * @param {Response} res - Respuesta con el escritor encontrado
 * @param {NextFunction} next - Middleware de manejo de errores
 * @returns {Promise<void>}
 * @throws {400} Si el formato del ID es inválido
 * @throws {404} Si el escritor no existe
 */
const getWriterById = async (
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

    const writer = await Writer.findById(id).lean<IWriter | null>();

    if (!writer) {
      res.status(404).json({
        success: false,
        message: "Writer not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Writer retrieved successfully",
      data: writer
    });
  } catch (error: unknown) { 
    next(error);
  }

}
 
const searchWriter = async (
  req: Request<{}, {}, {}, { term?: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => { 
  try {
      const parseResult = SearchWriterQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid search query",
          error: { issues: parseResult.error.issues.map(i => i.message) },
        });
        return;
      }
  
      const { term } = parseResult.data;
  
      const writers = await Writer.find(
        { $text: { $search: term } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(20)
        .lean<IWriter[]>();
  
      let results = writers;
      if (writers.length === 0) {
        const regex = new RegExp(escapeRegExp(term), "i");
        
        results = await Writer.find({
          $or: [
            { firstName: regex },
            { lastName: regex },
          ],
        })
          .limit(20)
          .lean<IWriter[]>();
      }
  
      res.status(200).json({
        success: true,
        message: results.length > 0 
          ? `Found ${results.length} writer(s) matching "${term}"`
          : `No writers found for "${term}"`,
        data: results,
      });
    } catch (error: unknown) {
      next(error);
    }
  
}

const addWriter = async (
  req: Request<{}, {}, AddWriterBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = AddWriterSchema.safeParse(req.body);
    if (!parseResult.success) { 
      const messages = parseResult.error.issues.map(i => i.message);
      
      res.status(400).json({
        success: false,
        message: "Invalid writer data",
        error: { issues: messages },
      });
      return;
    }

    const writerData = parseResult.data;

    const newWriter = await Writer.create(writerData);
    const writerDTO = newWriter.toObject();

    res.status(201).json({
      success: true,
      message: "Writer created successfully",
      data: writerDTO,
    });
    
  } catch (error: unknown) {
    next(error);
  }
};

const updateWriter = async (
  req: Request<{ id: string }, {}, UpdateWriterBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => { 
  try {
    if (!mongoose.isValidObjectId(req.params.id)) { 
      res.status(400).json({
        success: false,
        message: "Invalid writer ID format",
      });
      return;
    }

    const parseResult = UpdateWriterSchema.safeParse(req.body);
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
    
    const updatedWriter = await Writer.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!updatedWriter) {
      res.status(404).json({
        success: false,
        message: "Writer not found",
      });
      return;
    }
    
    const writerDTO = updatedWriter.toObject();

    res.status(200).json({
      success: true,
      message: "Writer updated successfully",
      data: writerDTO,
    });

    console.log(`[WRITER UPDATED] ${updatedWriter.firstName} ${updatedWriter.lastName}`);
    
  } catch (error: unknown) {
    next(error);
  }
};

const deleteWriter = async (
  req: Request<{ id: string }>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid writer ID format",
      });
      return;
    }
    
    const deletedWriter = await Writer.findByIdAndDelete(req.params.id);
    
    if (!deletedWriter) { 
      res.status(404).json({
        success: false,
        message: "Writer not found",
      });
      return;
    }

    const deletedWriterDTO = deletedWriter.toObject();

    res.status(200).json({
      success: true,
      message: `${deletedWriterDTO.firstName} ${deletedWriterDTO.lastName} deleted successfully`,
    });

    console.log(`[WRITER DELETED] ${deletedWriter.firstName} ${deletedWriter.lastName} (ID: ${deletedWriter._id})`);
    
  } catch (error: unknown) {
    next(error);
  }
};


 
export { addWriter, updateWriter, deleteWriter, getWriters, searchWriter, getWriterById };