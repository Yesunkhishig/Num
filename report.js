// Updated report.js - Fixed download report functionality
// This file handles JotForm report viewing and downloading

// JotForm Configuration
const JOTFORM_REPORT_URL = 'https://www.jotform.com/table/251397324877065';
const JOTFORM_API_KEY = '049a74d45e149010e2cb165c4ea20682';
const JOTFORM_REPORT_ID = '251397324877065';

document.addEventListener('DOMContentLoaded', () => {
  setupReportButtons();
});

/**
 * Setup report viewing and download buttons
 */
function setupReportButtons() {
  // Find container for report buttons
  const reportActionsContainer = document.getElementById('reportActions');
  if (!reportActionsContainer) {
    // Create container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'reportActions';
    container.className = 'report-actions';
    
    // Add container to the page
    const authorizedContent = document.getElementById('authorizedContent');
    if (authorizedContent) {
      authorizedContent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    
    // Use the newly created container
    setupReportButtonsInContainer(container);
  } else {
    // Use existing container
    setupReportButtonsInContainer(reportActionsContainer);
  }
}

/**
 * Setup report buttons in the specified container
 * @param {HTMLElement} container - Container element
 */
function setupReportButtonsInContainer(container) {
  // Create "See Report" button
  const viewReportBtn = document.createElement('button');
  viewReportBtn.className = 'btn btn-primary';
  viewReportBtn.textContent = 'See Report';
  viewReportBtn.addEventListener('click', viewReport);
  
  // Create "Download Report" button
  const downloadReportBtn = document.createElement('button');
  downloadReportBtn.className = 'btn btn-secondary';
  downloadReportBtn.textContent = 'Download Report';
  downloadReportBtn.addEventListener('click', downloadReport);
  
  // Add buttons to container
  container.appendChild(viewReportBtn);
  container.appendChild(downloadReportBtn);
  
  // Add styles
  addReportStyles();
}

/**
 * View JotForm report in a new tab
 */
function viewReport() {
  // Check if user is logged in
  const storedUser = localStorage.getItem('numforms_user');
  if (!storedUser) {
    alert('Please log in to view the report');
    return;
  }
  
  // Open report in new tab
  window.open(JOTFORM_REPORT_URL, '_blank');
}

/**
 * Download JotForm report as Excel
 * Uses server-side endpoint to handle the download properly
 */
function downloadReport() {
  // Check if user is logged in
  const storedUser = localStorage.getItem('numforms_user');
  if (!storedUser) {
    alert('Please log in to download the report');
    return;
  }
  
  // Use the server endpoint to download the report
  // This avoids CORS issues and ensures proper file download
  window.location.href = '/api/jotform/report/download';
}

/**
 * Add styles for report buttons
 */
function addReportStyles() {
  // Create style element if it doesn't exist
  let styleEl = document.getElementById('report-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'report-styles';
    document.head.appendChild(styleEl);
  }
  
  // Add styles
  styleEl.textContent = `
    .report-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }
    
    .report-actions .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    .report-actions .btn-primary {
      background-color: var(--primary-color, #4a6cf7);
      color: white;
      border: none;
    }
    
    .report-actions .btn-secondary {
      background-color: white;
      color: var(--primary-color, #4a6cf7);
      border: 1px solid var(--primary-color, #4a6cf7);
    }
  `;
}

// Export functions for use in other modules
window.ReportModule = {
  setupReportButtons,
  viewReport,
  downloadReport
};
