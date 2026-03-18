const mongoose = require('mongoose');

/**
 * Compliance & Documents Schema
 * Stores compliance records, financial documents, audit trails
 */

const complianceDocumentSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    documentType: {
      type: String,
      enum: [
        'tax-return',
        'audit-report',
        'bank-statement',
        'invoice',
        'receipt',
        'attendance-record',
        'expense-report',
        'other',
      ],
      required: true,
    },
    period: {
      startDate: Date,
      endDate: Date,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: String,
    metadata: {
      amount: mongoose.Decimal128,
      transactionCount: Number,
      referenceNumber: String,
      externalId: String,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'archived'],
      default: 'draft',
    },
    auditTrail: [
      {
        action: String,
        performedBy: mongoose.Schema.Types.ObjectId,
        performedAt: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true },
);

// Indexes
complianceDocumentSchema.index({ hostel: 1, documentType: 1 });
complianceDocumentSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
complianceDocumentSchema.index({ uploadedBy: 1 });
complianceDocumentSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('ComplianceDocument', complianceDocumentSchema);
