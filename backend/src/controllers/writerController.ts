import type { Request, Response, NextFunction } from "express";
import { Writer } from "../models/writerModel.js";
import type { QueryResponse } from "../types/queryResponse.js";
import type { AddWriterBody, UpdateWriterBody } from "../schemas/writerSchema.js";
import { AddWriterSchema, UpdateWriterSchema } from "../schemas/writerSchema.js";
import mongoose from 'mongoose';
import type { IWriter } from "../types/writerInterface.js";

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
        message: "Invalid book data",
        error: { issues: messages },
      });
      return;
    }

    const writerData = parseResult.data;

    const newWriter = await Writer.create(writerData);
    const writerDTO = newWriter.toObject()

    res.status(201).json({
      success: true,
      message: "Writer Quote created successfully",
      data: writerDTO,
    })
    
  } catch (error: unknown) {
    next(error)
  }
}
 
export {addWriter}