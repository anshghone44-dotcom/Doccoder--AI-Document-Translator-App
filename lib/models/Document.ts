import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDocument extends Document {
  documentId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  operation: 'translate' | 'summarize';
  model: 'gpt-5' | 'claude-sonnet';
  language?: string;
  result: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    documentId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    operation: {
      type: String,
      enum: ['translate', 'summarize'],
      required: true,
    },
    model: {
      type: String,
      enum: ['gpt-5', 'claude-sonnet'],
      required: true,
    },
    language: {
      type: String,
    },
    result: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;