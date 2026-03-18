/**
 * Compliance Management Controller
 * Handles compliance documents, audit trails, and financial records
 */

const ComplianceDocument = require('../models/ComplianceDocument');
const { validateDateString } = require('../utils/validation');

/**
 * POST /api/compliance/documents
 * Upload compliance document
 */
async function uploadDocument(req, res) {
  try {
    const { documentType, title, period, description } = req.body;
    const hostel = req.user.hostel;

    if (!documentType || !title) {
      return res.status(400).json({
        success: false,
        error: 'Document type and title are required',
      });
    }

    const document = new ComplianceDocument({
      hostel,
      documentType,
      title,
      description,
      period: period || {},
      uploadedBy: req.user._id,
      fileUrl: req.file ? req.file.url : null,
      fileName: req.file ? req.file.filename : null,
    });

    await document.save();

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/compliance/documents
 * Get compliance documents
 */
async function getDocuments(req, res) {
  try {
    const { documentType, status, limit = 50, skip = 0 } = req.query;
    const hostel = req.user.hostel;

    const query = { hostel };

    if (documentType) query.documentType = documentType;
    if (status) query.status = status;

    const documents = await ComplianceDocument.find(query)
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await ComplianceDocument.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/compliance/documents/:id
 * Get specific compliance document
 */
async function getDocument(req, res) {
  try {
    const document = await ComplianceDocument.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Check authorization
    if (document.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this document',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/compliance/documents/:id/verify
 * Verify compliance document
 */
async function verifyDocument(req, res) {
  try {
    const { status, notes } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status',
      });
    }

    const document = await ComplianceDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Check authorization - only hostel admin can verify
    if (req.user.role !== 'hostelAdmin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can verify documents',
      });
    }

    document.verificationStatus = status;
    document.verifiedBy = req.user._id;
    document.verificationNotes = notes;

    // Add to audit trail
    document.auditTrail.push({
      action: `Document ${status}`,
      performedBy: req.user._id,
      details: notes,
    });

    await document.save();

    res.json({
      success: true,
      data: document,
      message: `Document ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/compliance/reports
 * Generate compliance report
 */
async function getComplianceReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const hostel = req.user.hostel;

    const query = {
      hostel,
      'period.startDate': { $gte: new Date(startDate || '2024-01-01') },
    };

    if (endDate) {
      query['period.endDate'] = { $lte: new Date(endDate) };
    }

    const documents = await ComplianceDocument.find(query);

    const report = {
      hostel,
      period: { startDate, endDate },
      totals: {
        total: documents.length,
        verified: documents.filter((d) => d.verificationStatus === 'verified').length,
        pending: documents.filter((d) => d.verificationStatus === 'pending').length,
        rejected: documents.filter((d) => d.verificationStatus === 'rejected').length,
      },
      byType: {},
      byStatus: {},
    };

    // Group by type and status
    documents.forEach((doc) => {
      report.byType[doc.documentType] = (report.byType[doc.documentType] || 0) + 1;
      report.byStatus[doc.verificationStatus] = (report.byStatus[doc.verificationStatus] || 0) + 1;
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /api/compliance/documents/:id
 * Delete compliance document
 */
async function deleteDocument(req, res) {
  try {
    const document = await ComplianceDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Only uploader or admin can delete
    if (
      document.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this document',
      });
    }

    await ComplianceDocument.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument,
  getComplianceReport,
  deleteDocument,
};
