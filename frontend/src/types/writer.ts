export interface Writer { 
  _id: string;
  lastName: string;
  firstName: string;
  titleBookQuote: string;
  recomended: boolean;
  bioDescription: string;
  bioQuote: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateWriterInput = { 
  lastName: string;
  firstName: string;
  titleBookQuote: string;
  recomended: boolean;
  bioDescription: string;
  bioQuote: string;
}

export type UpdateWriterInput = Partial<CreateWriterInput>;

export interface WritersResponse {
  success: true;
  message: string;
  data: Writer[];
}

export interface WriterResponse {
  success: true;
  message: string;
  data: Writer;
}