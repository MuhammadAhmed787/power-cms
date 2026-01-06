import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  purpose: {
    type: String,
    enum: ['complaint', 'assignment', 'resolution'],
    default: 'complaint'
  }
})

const ResolutionAttachmentSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String }
})

const AssignedUserSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: String,
  name: { type: String, required: true },
  role: {
    name: String
  }
})

const OnlineComplaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
  },

  company: {
    companyName: String,
    companyId: String,
    city: String,
    address: String,
    companyRepresentative: String,
    phoneNumber: String,
    support: String,
  },

  softwareType: {
    type: String,
    enum: [
      'Finance Manager',
      'Finance Controller',
      'Power Accounting',
      'Finance Manager Urdu',
      'Power-Pos'
    ],
    required: true,
  },

  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  complaintRemarks: { type: String, required: true },

  attachments: [AttachmentSchema],

  assignedTo: AssignedUserSchema,
  assignedDate: Date,
  assignmentRemarks: String,
  assignmentAttachments: [AttachmentSchema],

  status: {
    type: String,
    default: 'registered',
    enum: ['registered', 'in-progress', 'resolved', 'closed']
  },

  // Developer resolution fields
  resolvedDate: Date,
  resolutionRemarks: String,
  resolutionAttachments: [ResolutionAttachmentSchema],
  
  developerStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'done', 'pending'],
    default: 'not-started'
  },

    createdBy: { type: String },
  clerkUserId: { type: String, required: true },
  updatedBy: { type: String },

    // Completion fields - ADD THESE NEW FIELDS
  completionApproved: { type: Boolean, default: false },
  completionApprovedAt: Date,
  completionRemarks: String,
  completionAttachment: [AttachmentSchema],
  
  // Rejection fields for completion - ADD THESE NEW FIELDS
  completionRejectionRemarks: String,
  completionRejectionAttachment: [AttachmentSchema],
  
  // Common fields for compatibility with Task interface
  code: String,
  working: String,
  priority: String,
  developer_status: String,
  finalStatus: String,
  TasksAttachment: [AttachmentSchema],
  TaskRemarks: String,
  // developer_attachment: [AttachmentSchema],
  // developer_remarks: String,
  developer_done_date: Date,
  rejectionAttachment: [AttachmentSchema],
  rejectionRemarks: String,
  developer_status_rejection: String,
  developer_rejection_remarks: String,
  developer_rejection_solve_attachment: [AttachmentSchema]

}, { timestamps: true })

OnlineComplaintSchema.index({ complaintNumber: 1 })
OnlineComplaintSchema.index({ status: 1 })
OnlineComplaintSchema.index({ 'assignedTo.id': 1 })
OnlineComplaintSchema.index({ createdAt: -1 })

export default mongoose.models.OnlineComplaint ||
  mongoose.model('OnlineComplaint', OnlineComplaintSchema)

// TypeScript interface
export interface IOnlineComplaint {
  _id: string;
  complaintNumber: string;
  company: {
    companyName: string;
    companyId: string;
    city: string;
    address: string;
    companyRepresentative: string;
    phoneNumber: string;
    support: string;
  };
  softwareType: string;
  contactPerson: string;
  contactPhone: string;
  complaintRemarks: string;
  attachments: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: {
      name: string;
    };
    _id?: string;
  };
  assignedDate?: string;
  assignmentRemarks?: string;
  assignmentAttachments?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;
  status: 'registered' | 'in-progress' | 'resolved' | 'closed';
  
  // Developer resolution fields
  resolvedDate?: string;
  resolutionRemarks?: string;
  resolutionAttachments?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    _id: string;
  }>;
  developerStatus?: 'not-started' | 'in-progress' | 'done' | 'pending';

    // Completion fields - ADD THESE
  completionApproved?: boolean;
  completionApprovedAt?: string;
  completionRemarks?: string;
  completionAttachment?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;
  
  // Rejection fields for completion - ADD THESE
  completionRejectionRemarks?: string;
  completionRejectionAttachment?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy?: string;
    purpose: string;
    _id: string;
  }>;

  createdBy?: string;
  clerkUserId: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  
  // Common fields to match ITask interface
  code?: string;
  working?: string;
  priority?: string;
  developer_status?: string;
  finalStatus?: string;
  TasksAttachment?: any[];
  TaskRemarks?: string;
  // developer_attachment?: any[];
  // developer_remarks?: string;
  developer_done_date?: string;
  rejectionAttachment?: any[];
  rejectionRemarks?: string;
  developer_status_rejection?: string;
  developer_rejection_remarks?: string;
  developer_rejection_solve_attachment?: any[];
  type?: 'task' | 'complaint';
}