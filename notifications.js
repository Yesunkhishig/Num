// Notifications Page JavaScript

// State management
let currentUser = null;
let userNotifications = [];

// DOM Functions
async function initNotificationsPage() {
  
  
  // Check if user is logged in
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      await loadNotifications();
      updateNotificationsUI();
      setupEventListeners();
      
      // Subscribe to real-time notifications
      subscribeToNotifications();
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("numforms_user");
      window.location.href = "index.html"; // Redirect to login page
    }
  } else {
    window.location.href = "index.html"; // Redirect to login page if not logged in
  }
}
/*
async function loadNotifications() {
  try {
    
    if (error) throw error;
    
    userNotifications = data || [];
  } catch (error) {
    console.error("Failed to load notifications from Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    const storedNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
    
    if (storedNotifications) {
      try {
        userNotifications = JSON.parse(storedNotifications);
      } catch (error) {
        console.error("Failed to parse stored notifications:", error);
        userNotifications = [];
      }
    } else {
      userNotifications = [];
    }
  }*/
    async function loadNotifications() {
      try {
        const stored = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
        userNotifications = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Failed to load notifications:", error);
        userNotifications = [];
      }
    
      updateNotificationBadge();
    }
    
  
  // Update notification badge
  updateNotificationBadge();


function updateNotificationsUI() {
  // Update navbar profile name
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = currentUser.firstName;
  }
  
  // Show empty state if no notifications
  if (userNotifications.length === 0) {
    document.getElementById("notificationList").classList.add("hidden");
    document.getElementById("emptyNotifications").classList.remove("hidden");
    document.getElementById("markAllReadBtn").style.display = "none";
    return;
  }
  
  // Show notification list and mark all read button
  document.getElementById("notificationList").classList.remove("hidden");
  document.getElementById("emptyNotifications").classList.add("hidden");
  
  // Hide mark all read button if no unread notifications
  const hasUnread = userNotifications.some(notification => !notification.is_read);
  document.getElementById("markAllReadBtn").style.display = hasUnread ? "block" : "none";
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...userNotifications].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  // Render notifications
  const notificationList = document.getElementById("notificationList");
  notificationList.innerHTML = "";
  
  sortedNotifications.forEach(notification => {
    const notificationElement = document.createElement("div");
    notificationElement.className = `notification-item ${notification.is_read ? "" : "unread"}`;
    notificationElement.setAttribute("data-id", notification.id);
    
    // Format date
    const date = new Date(notification.created_at);
    const formattedDate = date.toLocaleString("mn-MN");
    
    // Build notification content
    notificationElement.innerHTML = `
      <div class="notification-header">
        <h3 class="notification-title">${notification.title}</h3>
        ${!notification.is_read ? 
          `<button class="btn btn-outline btn-sm mark-read-btn">Уншсан</button>` : 
          ''}
      </div>
      <p class="notification-message">${notification.message}</p>
      <p class="notification-time">${formattedDate}</p>
      ${notification.related_type === "submission" && notification.related_id ? 
        `<div class="notification-action">
          <a href="view-submission.html?id=${notification.related_id}" class="notification-link">Өргөдөл харах</a>
        </div>` : 
        ''}
    `;
    
    notificationList.appendChild(notificationElement);
    
    // Add event listener for mark as read button
    const markReadBtn = notificationElement.querySelector(".mark-read-btn");
    if (markReadBtn) {
      markReadBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        markAsRead(notification.id);
      });
    }
    
    // Add event listener for clicking on the notification
    notificationElement.addEventListener("click", () => {
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
      
      // Navigate to related content if available
      if (notification.related_type === "submission" && notification.related_id) {
        window.location.href = `view-submission.html?id=${notification.related_id}`;
      }
    });
  });
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    const unreadCount = userNotifications.filter(n => !n.is_read).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function setupEventListeners() {
  // Mark all as read button
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
  }
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }
  
  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

async function markAsRead(notificationId) {
  try {
    // Update notification in Supabase
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    // Update local state
    userNotifications = userNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, is_read: true };
      }
      return notification;
    });
    
    // Update UI
    updateNotificationsUI();
    updateNotificationBadge();
    
  } catch (error) {
    console.error("Failed to mark notification as read in Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    userNotifications = userNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, is_read: true };
      }
      return notification;
    });
    
    // Save to localStorage
    localStorage.setItem(`numforms_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
    
    // Update UI
    updateNotificationsUI();
    updateNotificationBadge();
  }
}

async function markAllAsRead() {
  try {
    // Update all notifications in Supabase
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    
    if (error) throw error;
    
    // Update local state
    userNotifications = userNotifications.map(notification => {
      return { ...notification, is_read: true };
    });
    
    // Update UI
    updateNotificationsUI();
    updateNotificationBadge();
    
    // Show success message
    showToast("Бүх мэдэгдэл уншсан болголоо");
    
  } catch (error) {
    console.error("Failed to mark all notifications as read in Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    userNotifications = userNotifications.map(notification => {
      return { ...notification, is_read: true };
    });
    
    // Save to localStorage
    localStorage.setItem(`numforms_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
    
    // Update UI
    updateNotificationsUI();
    updateNotificationBadge();
    
    // Show success message
    showToast("Бүх мэдэгдэл уншсан болголоо");
  }
}

function subscribeToNotifications() {
  // Subscribe to real-time notifications
  const channel = supabaseClient
    .channel(`notifications-${currentUser.id}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${currentUser.id}`
    }, payload => {
      console.log('New notification received:', payload);
      
      // Add new notification to the list
      userNotifications.unshift(payload.new);
      
      // Update UI
      updateNotificationsUI();
      updateNotificationBadge();
      
      // Show toast notification
      showToast(payload.new.title);
    })
    .subscribe();
}

function toggleMobileMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

function handleLogout() {
  // Clear user data
  localStorage.removeItem("numforms_user");
  
  // Redirect to home page
  window.location.href = "index.html";
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast fade-in";
  toast.textContent = message;
  
  // Append to body
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("fade-in");
    toast.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Create and add toast styles dynamically
const style = document.createElement("style");
style.textContent = `
  .toast {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background-color: var(--primary-color);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  }
  
  .fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initNotificationsPage);
