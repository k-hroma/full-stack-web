import { z } from "zod";

const AddWriterSchema = z.object({
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Author last name is required" }),

  firstName: z
    .string()
    .trim()
    .min(1, { message: "Author first name is required" }),
  titleBookQuote: z
      .string()
      .trim()
      .min(1, { message: "Author first name is required" }),
    
  recomended: z
    .boolean()
    .default(false),

  bioDescription: z
    .string()
    .trim()
    .min(1, { message: "Description is required" }),
  
  bioQuote: z
    .string()
    .trim()
    .min(1, { message: "Quote is requires" })

}).strict();

type AddWriterBody = z.infer<typeof AddWriterSchema>

const UpdateWriterSchema = z
  .object({
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Author last name is required" }),

    firstName: z
      .string()
      .trim()
      .min(1, { message: "Author first name is required" }),
    
    titleBookQuote: z
      .string()
      .trim()
      .min(1, { message: "Author first name is required" }),
    
    recomended: z
      .boolean()
      .default(false),

    bioDescription: z
      .string()
      .trim()
      .min(1, { message: "Description is required" }),
  
    bioQuote: z
      .string()
      .trim()
      .min(1, { message: "Quote is requires" })

  }).strict().partial();

type UpdateWriterBody = z.infer<typeof UpdateWriterSchema>;

const SearchWriterQuerySchema = z.object({
  term: z
    .string()
    .trim()
    .min(1, { message: "Search term is required" })
    .max(100, { message: "Search term too long" }),
});

type SearchWriterQuery = z.infer<typeof SearchWriterQuerySchema>;

export type { 
  AddWriterBody,
  UpdateWriterBody,
  SearchWriterQuery
}

export { AddWriterSchema, UpdateWriterSchema, SearchWriterQuerySchema }