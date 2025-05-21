// Supabase client setup
const supabaseUrl = 'https://vornofxohrghydiwnpjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcm5vZnhvaHJnaHlkaXducGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTMzOTIsImV4cCI6MjA2Mjc2OTM5Mn0.-oW8JetWwaVHTTdQUMcfmq5gATUt3cArInHSiPqZr78';

// Initialize Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// User authentication functions
async function signUpUser(email, password, userData) {
  try {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    
    return { user, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
}

async function signInUser(email, password) {
  try {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

// Form submission functions
async function createFormSubmission(submissionData) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([submissionData])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating form submission:', error);
    return { data: null, error };
  }
}

async function getFormSubmission(id) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting form submission:', error);
    return { data: null, error };
  }
}

async function getFormSubmissionByJotformId(jotformId) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('jotform_submission_id', jotformId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting form submission by Jotform ID:', error);
    return { data: null, error };
  }
}

async function updateFormSubmission(id, updateData) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating form submission:', error);
    return { data: null, error };
  }
}

async function getUserFormSubmissions(userId) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user form submissions:', error);
    return { data: null, error };
  }
}

async function getAssignedFormSubmissions(staffId) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('assigned_to', staffId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting assigned form submissions:', error);
    return { data: null, error };
  }
}

// Comment functions
async function addSubmissionComment(commentData) {
  try {
    const { data, error } = await supabase
      .from('submission_comments')
      .insert([commentData])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error adding submission comment:', error);
    return { data: null, error };
  }
}

async function getSubmissionComments(submissionId) {
  try {
    const { data, error } = await supabase
      .from('submission_comments')
      .select(`
        *,
        users:user_id (first_name, last_name, user_type)
      `)
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting submission comments:', error);
    return { data: null, error };
  }
}

// Notification functions
async function createNotification(notificationData) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
}

async function getUserNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return { data: null, error };
  }
}

async function markNotificationAsRead(id) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { data: null, error };
  }
}

async function markAllNotificationsAsRead(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { data: null, error };
  }
}

// Staff assignment functions
async function getStaffAssignments() {
  try {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        staff:staff_id (id, first_name, last_name)
      `);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting staff assignments:', error);
    return { data: null, error };
  }
}

// Real-time subscriptions
function subscribeToNewSubmissions(callback) {
  return supabase
    .channel('public:form_submissions')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'form_submissions' 
    }, callback)
    .subscribe();
}

function subscribeToSubmissionUpdates(submissionId, callback) {
  return supabase
    .channel(`submission-${submissionId}`)
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'form_submissions',
      filter: `id=eq.${submissionId}`
    }, callback)
    .subscribe();
}

function subscribeToNewNotifications(userId, callback) {
  return supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
}

// Export all functions
const SupabaseService = {
  // Auth
  signUpUser,
  signInUser,
  signOut,
  
  // Form submissions
  createFormSubmission,
  getFormSubmission,
  getFormSubmissionByJotformId,
  updateFormSubmission,
  getUserFormSubmissions,
  getAssignedFormSubmissions,
  
  // Comments
  addSubmissionComment,
  getSubmissionComments,
  
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  // Staff assignments
  getStaffAssignments,
  
  // Real-time subscriptions
  subscribeToNewSubmissions,
  subscribeToSubmissionUpdates,
  subscribeToNewNotifications
};
