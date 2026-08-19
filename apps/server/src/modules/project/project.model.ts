import mongoose, { Document, Schema } from 'mongoose';

export type ServiceType = 
  | 'cctv' 
  | 'access-control' 
  | 'fire-safety' 
  | 'networking' 
  | 'home-automation'
  | 'other';

export type ProjectStatus = 
  | 'pending'      // Customer submitted, waiting for admin review
  | 'quoted'       // Admin sent quote, waiting for customer
  | 'accepted'     // Customer accepted quote
  | 'rejected'     // Customer rejected quote
  | 'in-progress'  // Work started
  | 'completed'    // Work completed
  | 'cancelled';   // Project cancelled

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface IProject extends Document {
  // User reference
  userId: mongoose.Types.ObjectId;
  
  // Service details
  serviceType: ServiceType;
  title: string;
  description: string;
  location?: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Quote details
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedTimeline?: string;
  quotedAt?: Date;
  quotedBy?: mongoose.Types.ObjectId; // Admin user ID
  
  // Project management
  status: ProjectStatus;
  priority: Priority;
  assignedTo?: mongoose.Types.ObjectId; // Admin/Team member
  
  // Progress tracking
  progress?: number; // 0-100
  milestones?: Array<{
    title: string;
    description?: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  
  // Documents/Attachments
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    uploadedAt: Date;
  }>;
  
  // Communication
  notes?: Array<{
    message: string;
    addedBy: mongoose.Types.ObjectId;
    addedAt: Date;
    isInternal?: boolean; // Admin-only notes
  }>;
  
  // Timestamps
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ['cctv', 'access-control', 'fire-safety', 'networking', 'home-automation', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    quoteAmount: {
      type: Number,
      min: 0,
    },
    quoteDetails: {
      type: String,
      maxlength: 2000,
    },
    estimatedTimeline: {
      type: String,
    },
    quotedAt: {
      type: Date,
    },
    quotedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    milestones: [{
      title: { type: String, required: true },
      description: { type: String },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
    }],
    attachments: [{
      url: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    }],
    notes: [{
      message: { type: String, required: true },
      addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      addedAt: { type: Date, default: Date.now },
      isInternal: { type: Boolean, default: false },
    }],
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ serviceType: 1 });
projectSchema.index({ assignedTo: 1 });
projectSchema.index({ priority: 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);

