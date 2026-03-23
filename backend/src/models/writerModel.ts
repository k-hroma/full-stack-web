import { Schema, model } from 'mongoose';
import type { IWriter } from '../types/writerInterface.js';

const writerSchema = new Schema<IWriter>(
  {
    recomended: {
      type: Boolean,
      default: false,
      required:true,
    },
    lastName: {
      type: String,
      required: [true, "Author last name is required"],
      trim: true,
    },
     firstName: {
      type: String,
      required: [true, "Author first name is required"],
      trim: true,
    },
    titleBookQuote: {
      type: String, 
      required: [true, "Title book quote is required"],
      trim: true,
    },
    bioQuote: {
    type: String, 
    required: [true, "Quote is required"], 
      trim: true,
    },
    bioDescription: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

writerSchema.index({ firstName: "text", lastName: "text" })

const Writer = model<IWriter>("Writer", writerSchema);

export {Writer}
