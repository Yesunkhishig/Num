// Initialize Supabase
const supabaseUrl = 'https://vornofxohrghydiwnpjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcm5vZnhvaHJnaHlkaXducGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTMzOTIsImV4cCI6MjA2Mjc2OTM5Mn0.-oW8JetWwaVHTTdQUMcfmq5gATUt3cArInHSiPqZr78';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const submissionContent = document.getElementById('submissionContent');
const unauthorizedMessage = document.getElementById('unauthorizedMessage');
const authorizedContent = document.getElementById('authorizedContent');
const staffActions = document.getElementById('staffActions');

// Current submission data
let currentSubmission = null;
let currentUser = null;

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  // Get submission ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const submissionId = urlParams.get('id');
  
  if (!submissionId) {
    showUnauthorized();
    return;
  }

  // Check if staff is logged in
  const storedUser = localStorage.getItem('numforms_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }

  // Load submission data
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error || !data) {
    showUnauthorized();
    return;
  }

  currentSubmission = data;

  fetch('https://api.jotform.com/form/https://form.jotform.com/251331717312447/submissions?apiKey=049a74d45e149010e2cb165c4ea20682')
  .then(response => response.json())
  .then(data => {
    const submissions = data.content;
    submissions.forEach(sub => {
      console.log(sub.answers); // You can extract and show each field
    });
  });


  // Check access rights
  if (currentUser && currentUser.id === data.assigned_to) {
    showAuthorized(data);
    if (data.status === 'pending') {
      staffActions.classList.remove('hidden');
      setupActionButtons();
    }
  } else {
    showUnauthorized();
  }
});

function showAuthorized(submission) {
  unauthorizedMessage.classList.add('hidden');
  authorizedContent.classList.remove('hidden');
  
  // Format dates
  const createdAt = new Date(submission.created_at).toLocaleString('mn-MN');
  
  // Fill in data
  document.getElementById('submissionTitle').textContent = `Өргөдлийн #${submission.id.slice(-6)}`;
  document.getElementById('submissionId').textContent = `ID: ${submission.id.slice(-6)}`;
  document.getElementById('submissionStatus').textContent = `Төлөв: ${getStatusDisplay(submission.status)}`;
  document.getElementById('submissionDate').textContent = `Огноо: ${createdAt}`;
  
  // Form data
  const formData = submission.form_data;
  document.getElementById('studentName').textContent = formData.name || 'Тодорхойгүй';
  document.getElementById('studentId').textContent = formData.studentID || 'Тодорхойгүй';
  document.getElementById('courseName').textContent = formData.course || 'Тодорхойгүй';
  document.getElementById('requestTitle').textContent = formData.title || 'Гарчиггүй';
  document.getElementById('requestDetails').textContent = formData.disputeDetails || 'Дэлгэрэнгүй мэдээлэл алга';
}

function showUnauthorized() {
  unauthorizedMessage.classList.remove('hidden');
  authorizedContent.classList.add('hidden');
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
  
  // Update in Supabase
  const { error } = await supabase
    .from('form_submissions')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      staff_comment: comment
    })
    .eq('id', currentSubmission.id);

  if (error) {
    alert('Алдаа гарлаа: ' + error.message);
    return;
  }

  // Create notification for student
  await createNotification(
    currentSubmission.user_id,
    `Таны өргөдлийг ${newStatus === 'approved' ? 'зөвшөөрлөө' : 'татгалзлаа'}`,
    `Шийдвэр: ${comment || 'Шалтгаан оруулаагүй'}`
  );

  alert(`Өргөдлийг амжилттай ${newStatus === 'approved' ? 'зөвшөөрлөө' : 'татгалзлаа'}`);
  window.location.reload();
}

async function createNotification(userId, title, message) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Notification creation failed:', error);
  }
}