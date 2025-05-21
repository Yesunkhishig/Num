
class LocalStorageDB {
  constructor() {
    this.initializeStorage();
  }


  initializeStorage() {
    // Initialize users collection
    if (!localStorage.getItem('numforms_users')) {
      localStorage.setItem('numforms_users', JSON.stringify([
        {
          id: 'staff4',
          email: '22b1NUM7873@stud.num.edu.mn',
          password: 'staff4password', 
          firstName: 'Staff',
          lastName: 'User',
          userType: 'staff',
          createdAt: new Date().toISOString()
        },
        {
          id: 'student1',
          email: 'student@num.edu.mn',
          password: 'student1password', 
          firstName: 'Student',
          lastName: 'User',
          userType: 'student',
          createdAt: new Date().toISOString()
        }
      ]));
    }

    // Initialize form submissions collection
    if (!localStorage.getItem('numforms_submissions')) {
      localStorage.setItem('numforms_submissions', JSON.stringify([]));
    }

    // Initialize notifications collection
    if (!localStorage.getItem('numforms_notifications')) {
      localStorage.setItem('numforms_notifications', JSON.stringify([]));
    }

    // Initialize comments collection
    if (!localStorage.getItem('numforms_comments')) {
      localStorage.setItem('numforms_comments', JSON.stringify([]));
    }

    // Initialize staff assignments collection
    if (!localStorage.getItem('numforms_staff_assignments')) {
      localStorage.setItem('numforms_staff_assignments', JSON.stringify([
        {
          id: '1',
          form_type: 'r_rating_request',
          staff_id: 'staff4'
        },
        {
          id: '2',
          form_type: 'grade_dispute_complaint',
          staff_id: 'staff4'
        },
        {
          id: '3',
          form_type: 'custom_request',
          staff_id: 'staff4'
        }
      ]));
    }
  }

  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // ==================== User Operations ====================

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data
   * @returns {object} User object or error
   */
  async signUpUser(email, password, userData) {
    try {
      const users = JSON.parse(localStorage.getItem('numforms_users') || '[]');
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return { user: null, error: { message: 'User already exists' } };
      }
      
      // Create new user
      const newUser = {
        id: this.generateId(),
        email,
        password, // In a real app, this would be hashed
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('numforms_users', JSON.stringify(users));
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = newUser;
      return { user: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error };
    }
  }

  /**
   * Sign in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} User object or error
   */
  async signInUser(email, password) {
    try {
      const users = JSON.parse(localStorage.getItem('numforms_users') || '[]');
      
      // Find user
      const user = users.find(user => user.email === email && user.password === password);
      if (!user) {
        return { user: null, error: { message: 'Invalid login credentials' } };
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User object or null
   */
  async getUser(userId) {
    try {
      const users = JSON.parse(localStorage.getItem('numforms_users') || '[]');
      const user = users.find(user => user.id === userId);
      
      if (!user) {
        return { data: null, error: { message: 'User not found' } };
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      return { data: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Error getting user:', error);
      return { data: null, error };
    }
  }

  // ==================== Form Submission Operations ====================

  /**
   * Create a new form submission
   * @param {object} submissionData - Form submission data
   * @returns {object} Submission object or error
   */
  async createFormSubmission(submissionData) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      
      // Create new submission with ID
      const newSubmission = {
        id: this.generateId(),
        ...submissionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      submissions.push(newSubmission);
      localStorage.setItem('numforms_submissions', JSON.stringify(submissions));
      
      return { data: newSubmission, error: null };
    } catch (error) {
      console.error('Error creating form submission:', error);
      return { data: null, error };
    }
  }

  /**
   * Get form submission by ID
   * @param {string} id - Submission ID
   * @returns {object} Submission object or error
   */
  async getFormSubmission(id) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const submission = submissions.find(sub => sub.id === id);
      
      if (!submission) {
        return { data: null, error: { message: 'Submission not found' } };
      }
      
      // Get comments for this submission
      const comments = await this.getSubmissionComments(id);
      
      // Return submission with comments
      return { 
        data: {
          ...submission,
          comments: comments.data || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting form submission:', error);
      return { data: null, error };
    }
  }

  /**
   * Get form submission by access key
   * @param {string} accessKey - Access key
   * @returns {object} Submission object or error
   */
  async getFormSubmissionByAccessKey(accessKey) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const submission = submissions.find(sub => sub.access_key === accessKey);
      
      if (!submission) {
        return { data: null, error: { message: 'Submission not found' } };
      }
      
      // Get comments for this submission
      const comments = await this.getSubmissionComments(submission.id);
      
      // Return submission with comments
      return { 
        data: {
          ...submission,
          comments: comments.data || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting form submission by access key:', error);
      return { data: null, error };
    }
  }

  /**
   * Get form submission by JotForm ID
   * @param {string} jotformId - JotForm submission ID
   * @returns {object} Submission object or error
   */
  async getFormSubmissionByJotformId(jotformId) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const submission = submissions.find(sub => sub.jotform_submission_id === jotformId);
      
      if (!submission) {
        return { data: null, error: { message: 'Submission not found' } };
      }
      
      return { data: submission, error: null };
    } catch (error) {
      console.error('Error getting form submission by Jotform ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Update form submission
   * @param {string} id - Submission ID
   * @param {object} updateData - Data to update
   * @returns {object} Updated submission or error
   */
  async updateFormSubmission(id, updateData) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const index = submissions.findIndex(sub => sub.id === id);
      
      if (index === -1) {
        return { data: null, error: { message: 'Submission not found' } };
      }
      
      // Update submission
      submissions[index] = {
        ...submissions[index],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('numforms_submissions', JSON.stringify(submissions));
      
      return { data: submissions[index], error: null };
    } catch (error) {
      console.error('Error updating form submission:', error);
      return { data: null, error };
    }
  }

  /**
   * Get form submissions by user ID
   * @param {string} userId - User ID
   * @returns {object} Array of submissions or error
   */
  async getUserFormSubmissions(userId) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const userSubmissions = submissions.filter(sub => sub.user_id === userId);
      
      return { data: userSubmissions, error: null };
    } catch (error) {
      console.error('Error getting user form submissions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get form submissions assigned to staff
   * @param {string} staffId - Staff ID
   * @returns {object} Array of submissions or error
   */
  async getAssignedFormSubmissions(staffId) {
    try {
      const submissions = JSON.parse(localStorage.getItem('numforms_submissions') || '[]');
      const assignedSubmissions = submissions.filter(sub => sub.assigned_to === staffId);
      
      return { data: assignedSubmissions, error: null };
    } catch (error) {
      console.error('Error getting assigned form submissions:', error);
      return { data: null, error };
    }
  }

  // ==================== Comment Operations ====================

  /**
   * Add comment to submission
   * @param {object} commentData - Comment data
   * @returns {object} Comment object or error
   */
  async addSubmissionComment(commentData) {
    try {
      const comments = JSON.parse(localStorage.getItem('numforms_comments') || '[]');
      
      // Create new comment with ID
      const newComment = {
        id: this.generateId(),
        ...commentData,
        created_at: new Date().toISOString()
      };
      
      comments.push(newComment);
      localStorage.setItem('numforms_comments', JSON.stringify(comments));
      
      // Get user info for the comment
      const { data: user } = await this.getUser(commentData.user_id);
      
      // Return comment with user info
      return { 
        data: {
          ...newComment,
          users: user
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error adding submission comment:', error);
      return { data: null, error };
    }
  }

  /**
   * Get comments for a submission
   * @param {string} submissionId - Submission ID
   * @returns {object} Array of comments or error
   */
  async getSubmissionComments(submissionId) {
    try {
      const comments = JSON.parse(localStorage.getItem('numforms_comments') || '[]');
      const submissionComments = comments.filter(comment => comment.submission_id === submissionId);
      
      // Get user info for each comment
      const commentsWithUsers = await Promise.all(submissionComments.map(async (comment) => {
        const { data: user } = await this.getUser(comment.user_id);
        return {
          ...comment,
          users: user
        };
      }));
      
      return { data: commentsWithUsers, error: null };
    } catch (error) {
      console.error('Error getting submission comments:', error);
      return { data: null, error };
    }
  }

  // ==================== Notification Operations ====================

  /**
   * Create a notification
   * @param {object} notificationData - Notification data
   * @returns {object} Notification object or error
   */
  async createNotification(notificationData) {
    try {
      const notifications = JSON.parse(localStorage.getItem('numforms_notifications') || '[]');
      
      // Create new notification with ID
      const newNotification = {
        id: this.generateId(),
        ...notificationData,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(newNotification);
      localStorage.setItem('numforms_notifications', JSON.stringify(notifications));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('numforms_notification', { 
        detail: { type: 'new', notification: newNotification } 
      }));
      
      return { data: newNotification, error: null };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @returns {object} Array of notifications or error
   */
  async getUserNotifications(userId) {
    try {
      const notifications = JSON.parse(localStorage.getItem('numforms_notifications') || '[]');
      const userNotifications = notifications.filter(notif => notif.user_id === userId);
      
      // Sort by created_at (newest first)
      userNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return { data: userNotifications, error: null };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { data: null, error };
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {object} Updated notification or error
   */
  async markNotificationAsRead(id) {
    try {
      const notifications = JSON.parse(localStorage.getItem('numforms_notifications') || '[]');
      const index = notifications.findIndex(notif => notif.id === id);
      
      if (index === -1) {
        return { data: null, error: { message: 'Notification not found' } };
      }
      
      // Update notification
      notifications[index] = {
        ...notifications[index],
        is_read: true
      };
      
      localStorage.setItem('numforms_notifications', JSON.stringify(notifications));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('numforms_notification', { 
        detail: { type: 'update', notification: notifications[index] } 
      }));
      
      return { data: notifications[index], error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {object} Updated notifications or error
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const notifications = JSON.parse(localStorage.getItem('numforms_notifications') || '[]');
      
      // Update all unread notifications for this user
      const updatedNotifications = notifications.map(notif => {
        if (notif.user_id === userId && !notif.is_read) {
          return { ...notif, is_read: true };
        }
        return notif;
      });
      
      localStorage.setItem('numforms_notifications', JSON.stringify(updatedNotifications));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('numforms_notification', { 
        detail: { type: 'mark_all_read', userId } 
      }));
      
      return { data: updatedNotifications.filter(notif => notif.user_id === userId), error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { data: null, error };
    }
  }

  // ==================== Staff Assignment Operations ====================

  /**
   * Get staff assignments
   * @returns {object} Array of staff assignments or error
   */
  async getStaffAssignments() {
    try {
      const assignments = JSON.parse(localStorage.getItem('numforms_staff_assignments') || '[]');
      
      // Get staff info for each assignment
      const assignmentsWithStaff = await Promise.all(assignments.map(async (assignment) => {
        const { data: staff } = await this.getUser(assignment.staff_id);
        return {
          ...assignment,
          staff
        };
      }));
      
      return { data: assignmentsWithStaff, error: null };
    } catch (error) {
      console.error('Error getting staff assignments:', error);
      return { data: null, error };
    }
  }

  /**
   * Get staff assignment by form type
   * @param {string} formType - Form type
   * @returns {object} Staff assignment or error
   */
  async getStaffAssignmentByFormType(formType) {
    try {
      const assignments = JSON.parse(localStorage.getItem('numforms_staff_assignments') || '[]');
      const assignment = assignments.find(a => a.form_type === formType);
      
      if (!assignment) {
        return { data: null, error: { message: 'Assignment not found' } };
      }
      
      return { data: assignment, error: null };
    } catch (error) {
      console.error('Error getting staff assignment by form type:', error);
      return { data: null, error };
    }
  }
}

// Create and export instance
const localStorageDB = new LocalStorageDB();

if (typeof module !== 'undefined') {
  module.exports = LocalStorageDB;
}
