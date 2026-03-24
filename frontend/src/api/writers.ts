import type{  CreateWriterInput, WriterResponse, WritersResponse, Writer, UpdateWriterInput } from '../types/writer';
import { httpClient } from './client';

export const createWriter = async (writer: CreateWriterInput): Promise<Writer> => {
  const response = await httpClient<WriterResponse>('/writers', {
    method: 'POST',
    body: JSON.stringify(writer),
  });
  return response.data;
};

export const updateWriter = async (id: string, updates: UpdateWriterInput): Promise<Writer> => {
  const response = await httpClient<WriterResponse>(`/writers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteWriter = async (id: string): Promise<void> => {
  await httpClient(`/writers/${id}`, {
    method: 'DELETE',
  });
};

export const searchWriters = async (term: string): Promise<Writer[]> => {
  const response = await httpClient<WritersResponse>(
      `/writers/search?term=${encodeURIComponent(term)}`
  );
    return response.data;
}
 
export const getWriters = async (): Promise<Writer[]> => {
  const response = await httpClient<WritersResponse>(`/writers`)
  console.log(response.data)
  return response.data
 }
 
