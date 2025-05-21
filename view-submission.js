import LocalStorageDB from './localStorage.js';
const db = new LocalStorageDB();


// JotForm Configuration
const JOTFORM_API_KEY = '049a74d45e149010e2cb165c4ea20682';
const JOTFORM_FORM_ID = '251331717312447';

// DOM Elements
const unauthorizedMessage = document.getElementById('unauthorizedMessage');
const authorizedContent = document.getElementById('authorizedContent');
const staffActions = document.getElementById('staffActions');
const jotFormIFrame = document.getElementById('jotFormIFrame');

let currentSubmission = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  
  try {
    const storedUser = localStorage.getItem('numforms_user');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }

    const submissionId = getSubmissionIdFromUrl();
    const accessKey = getAccessKeyFromUrl();
    
    if (!submissionId) {
      throw new Error('No submission ID provided');
    }

    
    
    // Then fetch JotForm data if available
    if (currentSubmission.jotform_submission_id) {
      await fetchJotFormSubmission(currentSubmission.jotform_submission_id);
    } else {
      // Display submission details from Supabase
      displaySubmissionDetails();
    }
    
    showAuthorizedContent();
    
  } catch (error) {
    console.error('Error:', error);
    showUnauthorized();
  } finally {
    hideLoading();
  }
});

async function loadData() {
  try {
    const storedRequests = localStorage.getItem("numforms_submissions");
    const allSubmissions = storedRequests ? JSON.parse(storedRequests) : [];

    if (currentUser.userType === "student") {
      userRequests = allSubmissions.filter(req => req.user_id === currentUser.id);
    } else {
      userRequests = allSubmissions.filter(req => req.assigned_to === currentUser.id);
    }

    allRequests = allSubmissions;

    const storedNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
    userNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];

  } catch (err) {
    console.error("Failed to load data from localStorage:", err);
  }
}


async function fetchJotFormSubmission(submissionId) {
  try {
    const response = await fetch(
      `https://api.jotform.com/submission/${submissionId}?apiKey=${JOTFORM_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.responseCode !== 200 || !data.content) {
      throw new Error(data.message || 'No submission data found');
    }

    const answers = data.content.answers;
    
    document.getElementById('studentName').textContent = getAnswerText(answers['3']);
    document.getElementById('studentId').textContent = getAnswerText(answers['4']);
    document.getElementById('courseName').textContent = getAnswerText(answers['5']);
    document.getElementById('requestTitle').textContent = getAnswerText(answers['6']);
    document.getElementById('requestDetails').textContent = getAnswerText(answers['7']);
    
    jotFormIFrame.src = `https://form.jotform.com/${JOTFORM_FORM_ID}?submissionId=${submissionId}`;
    
  } catch (error) {
    console.error('Failed to fetch JotForm submission:', error);
    // Don't throw error, just display what we have from Supabase
    displaySubmissionDetails();
  }
}

function displaySubmissionDetails() {
  // Display submission details from Supabase data
  if (currentSubmission) {
    document.getElementById('studentId').textContent = currentSubmission.user_id || '—';
    document.getElementById('requestTitle').textContent = currentSubmission.title || '—';
    document.getElementById('requestDetails').textContent = currentSubmission.description || '—';
    
    // If we have a form URL, display it in the iframe
    if (currentSubmission.form_url) {
      jotFormIFrame.src = currentSubmission.form_url;
    } else {
      // Hide the iframe if no form URL
      jotFormIFrame.style.display = 'none';
    }
  }
}

async function loadSubmissionData(submissionId, accessKey) {
  const { data, error } = accessKey
    ? await db.getFormSubmissionByAccessKey(accessKey)
    : await db.getFormSubmission(submissionId);

  if (error || !data) {
    throw new Error("Submission not found");
  }

  currentSubmission = data;

  if (!accessKey && currentUser) {
    if (currentUser.userType === 'staff' && currentSubmission.assigned_to !== currentUser.id) {
      throw new Error("Unauthorized: Not assigned to you.");
    }
    if (currentUser.userType === 'student' && currentSubmission.user_id !== currentUser.id) {
      throw new Error("Unauthorized: Not your submission.");
    }
  }

  // Update UI
  displaySubmissionDetails();
}


function getAnswerText(answer) {
  if (!answer) return '—';
  return answer.prettyFormat || answer.answer || '—';
}

function getSubmissionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || params.get('submissionId');
}

function getAccessKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key');
}

function showAuthorizedContent() {
  unauthorizedMessage.classList.add('hidden');
  authorizedContent.classList.remove('hidden');
}

function showUnauthorized() {
  unauthorizedMessage.classList.remove('hidden');
  authorizedContent.classList.add('hidden');
}

function showLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
}
  
function hideLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

function getStatusDisplay(status) {
  const statusMap = {
    'pending': 'Хүлээгдэж буй',
    'approved': 'Зөвшөөрсөн',
    'rejected': 'Татгалзсан'
  };
  return statusMap[status] || status;
}

function setupActionButtons() {
  document.getElementById('approveBtn').addEventListener('click', () => {
    handleDecision('approved');
  });
  
  document.getElementById('rejectBtn').addEventListener('click', () => {
    const comment = document.getElementById('staffComment').value;
    if (!comment.trim()) {
      alert('Татгалзах шалтгаанаа бичнэ үү');
      return;
    }
    handleDecision('rejected');
  });
}

async function handleDecision(newStatus) {
  const comment = document.getElementById('staffComment').value;
  
  if (!currentSubmission) {
    alert('No submission data available');
    return;
  }

  try {
    // First add the comment
    const { error: commentError } = await supabaseClient
      .from('submission_comments')
      .insert({
        submission_id: currentSubmission.id,
        user_id: currentUser.id,
        content: comment,
        created_at: new Date().toISOString()
      });
      
    if (commentError) throw commentError;
   
    // Then update the submission status
    const { error } = await supabaseClient
      .from('form_submissions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubmission.id);

    if (error) throw error;

    // Create notification for student
    await createNotification(
      currentSubmission.user_id,
      `Таны өргөдлийг ${newStatus === 'approved' ? 'зөвшөөрлөө' : 'татгалзлаа'}`,
      `Шийдвэр: ${comment || 'Шалтгаан оруулаагүй'}`
    );

    alert(`Өргөдлийг амжилттай ${newStatus === 'approved' ? 'зөвшөөрлөө' : 'татгалзлаа'}`);
    window.location.reload();
    
  } catch (error) {
    console.error('Error handling decision:', error);
    alert('Алдаа гарлаа: ' + error.message);
  }
}

async function createNotification(userId, title, message) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        is_read: false,
        related_type: 'submission',
        related_id: currentSubmission.id,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    
  } catch (error) {
    console.error('Notification creation failed:', error);
    throw error;
  }
}

function subscribeToSubmissionUpdates(submissionId) {
  // Subscribe to real-time updates for this submission
  const channel = supabaseClient
    .channel(`submission-${submissionId}`)
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'form_submissions',
      filter: `id=eq.${submissionId}`
    }, payload => {
      console.log('Submission updated:', payload);
      // Update the status display
      document.getElementById('submissionStatus').textContent = `Төлөв: ${getStatusDisplay(payload.new.status)}`;
      
      // If status changed from pending, hide staff actions
      if (payload.new.status !== 'pending') {
        staffActions.classList.add('hidden');
      }
    })
    .subscribe();
    
  // Also subscribe to new comments
  const commentsChannel = supabaseClient
    .channel(`comments-${submissionId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'submission_comments',
      filter: `submission_id=eq.${submissionId}`
    }, async payload => {
      console.log('New comment:', payload);
      // Reload the page to show the new comment
      window.location.reload();
    })
    .subscribe();
}

document.getElementById('approveBtn').addEventListener('click', async () => {
  await db.updateFormSubmissionStatus(currentSubmission.id, 'approved');
  await db.createNotification({
    user_id: currentSubmission.user_id,
    title: 'Өргөдөл зөвшөөрөгдлөө',
    message: `Таны "${currentSubmission.title}" өргөдөл зөвшөөрөгдсөн.`,
    is_read: false,
    related_type: 'submission',
    related_id: currentSubmission.id
  });
  alert('Өргөдөл зөвшөөрөгдлөө');
  location.reload();
});

document.getElementById('rejectBtn').addEventListener('click', async () => {
  await db.updateFormSubmissionStatus(currentSubmission.id, 'rejected');
  await db.createNotification({
    user_id: currentSubmission.user_id,
    title: 'Өргөдөл татгалзсан',
    message: `Таны "${currentSubmission.title}" өргөдөл татгалзсан.`,
    is_read: false,
    related_type: 'submission',
    related_id: currentSubmission.id
  });
  alert('Өргөдөл татгалзсан');
  location.reload();
});
