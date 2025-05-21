// server.js - Updated with direct Excel download endpoint
// This file handles the integration between JotForm and local storage

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');
const path = require('path');
const axios = require('axios');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// JotForm API key
const JOTFORM_API_KEY = '049a74d45e149010e2cb165c4ea20682';
const JOTFORM_REPORT_ID = '251397324877065';

// Helper function to generate access key
function generateAccessKey() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper function to generate QR code
async function generateQRCode(url) {
  try {
    return await qrcode.toDataURL(url);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

// JotForm webhook endpoint
app.post('/webhook/jotform', async (req, res) => {
  try {
    console.log('Received webhook from JotForm:', req.body);
    
    // Extract form submission data
    const formData = req.body;
    const formId = formData.formID;
    const submissionId = formData.submissionID;
    
    // Extract relevant fields from the form data
    const answers = formData.rawRequest;
    
    // Get student ID from the form (assuming it's in field 4)
    const studentId = answers['4_text'] || 'unknown';
    
    // Get form title from the form (assuming it's in field 6)
    const title = answers['6_text'] || 'New Form Submission';
    
    // Get form description from the form (assuming it's in field 7)
    const description = answers['7_text'] || '';
    
    // Generate a unique access key for QR code
    const accessKey = generateAccessKey();
    
    // Determine form type based on form ID
    let formType = 'custom_request';
    switch(formId) {
      case '251119434684459':
        formType = 'r_rating_request';
        break;
      case '251331717312447':
        formType = 'grade_dispute_complaint';
        break;
      // Add more form types as needed
    }
    
    // Load localStorage module
    const localStorageDB = require('./public/localStorage');
    
    // Find the appropriate staff member to assign
    const { data: staffAssignment, error: staffError } = await localStorageDB.getStaffAssignmentByFormType(formType);
    
    let assignedTo = null;
    if (!staffError && staffAssignment) {
      assignedTo = staffAssignment.staff_id;
    }
    
    // Store submission in localStorage
    const { data: submission, error } = await localStorageDB.createFormSubmission({
      jotform_submission_id: submissionId,
      user_id: studentId,
      title: title,
      description: description,
      type: formType,
      form_url: `https://form.jotform.com/${formId}?submissionID=${submissionId}`,
      status: 'pending',
      assigned_to: assignedTo,
      access_key: accessKey,
      form_data: answers
    });
    
    if (error) {
      console.error('Error storing submission in localStorage:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    // Create notification for assigned staff member
    if (assignedTo) {
      const { error: notifError } = await localStorageDB.createNotification({
        user_id: assignedTo,
        title: 'Шинэ өргөдөл',
        message: `Танд шинэ өргөдөл хуваарилагдлаа: ${title}`,
        is_read: false,
        related_type: 'submission',
        related_id: submission.id
      });
      
      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }
    
    // Emit socket event for real-time updates
    io.emit('new-submission', {
      id: submission.id,
      title: title,
      assignedTo: assignedTo
    });
    
    // Generate QR code for the submission
    const submissionUrl = `${req.protocol}://${req.get('host')}/view-submission.html?id=${submission.id}&key=${accessKey}`;
    const qrCodeDataUrl = await generateQRCode(submissionUrl);
    
    res.json({
      success: true,
      message: 'Form submission processed successfully',
      submissionId: submission.id,
      qrCode: qrCodeDataUrl
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { key } = req.query;
    
    // Load localStorage module
    const localStorageDB = require('./public/localStorage');
    
    let data, error;
    
    // If access key is provided, use it for authentication
    if (key) {
      ({ data, error } = await localStorageDB.getFormSubmissionByAccessKey(key));
    } else {
      // Otherwise use the ID
      ({ data, error } = await localStorageDB.getFormSubmission(id));
    }
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to update submission status
app.post('/api/submissions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, userId } = req.body;
    
    if (!status || !userId) {
      return res.status(400).json({ success: false, error: 'Status and userId are required' });
    }
    
    // Load localStorage module
    const localStorageDB = require('./public/localStorage');
    
    // Update submission status
    const { data: submission, error } = await localStorageDB.updateFormSubmission(id, {
      status
    });
    
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
    // Add comment if provided
    if (comment) {
      const { error: commentError } = await localStorageDB.addSubmissionComment({
        submission_id: id,
        user_id: userId,
        content: comment
      });
      
      if (commentError) {
        console.error('Error adding comment:', commentError);
      }
    }
    
    // Create notification for the student
    const { error: notifError } = await localStorageDB.createNotification({
      user_id: submission.user_id,
      title: status === 'approved' ? 'Өргөдөл зөвшөөрөгдлөө' : 'Өргөдөл татгалзагдлаа',
      message: `Таны "${submission.title}" өргөдөл ${status === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзагдлаа'}. ${comment ? `Тайлбар: ${comment}` : ''}`,
      is_read: false,
      related_type: 'submission',
      related_id: id
    });
    
    if (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, data: submission });
    
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get JotForm report
app.get('/api/jotform/report', (req, res) => {
  // Redirect to JotForm report URL
  res.redirect('https://www.jotform.com/table/251397324877065');
});

// API endpoint to download JotForm report as Excel
app.get('/api/jotform/report/download', async (req, res) => {
  try {
    // Direct Excel download URL
    const excelUrl = `https://www.jotform.com/excel/${JOTFORM_REPORT_ID}?apiKey=${JOTFORM_API_KEY}`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=jotform_report_${JOTFORM_REPORT_ID}.xlsx`);
    
    // Fetch the Excel file and pipe it to the response
    const response = await axios({
      method: 'GET',
      url: excelUrl,
      responseType: 'stream'
    });
    
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
