
// Forms Page JavaScript

// State management
let currentUser = null;
let userRequests = [];
let allRequests = [];
let userNotifications = [];
let currentRequestId = null;
let currentAction = null;

const REQUEST_TYPES = {
  "course_withdrawal": "Хичээл цуцлах",
  "refund": "Төлбөрийн буцаалт",
  "grade_dispute": "Дүнгийн маргаан",
  "leave": "Чөлөө авах",
  "other": "Бусад"
};

// DOM Functions
function initFormsPage() {
  // Check if user is logged in
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      loadData();
      updateUI();
      setupEventListeners();
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("numforms_user");
      window.location.href = "index.html"; // Redirect to login page
    }
  } else {
    window.location.href = "index.html"; // Redirect to login page if not logged in
  }
}

function loadData() {
  // Load requests from localStorage
  const storedRequests = localStorage.getItem("numforms_requests");
  
  if (storedRequests) {
    try {
      allRequests = JSON.parse(storedRequests);
      // Filter requests for student or get all for staff
      if (currentUser.userType === "student") {
        userRequests = allRequests.filter(req => req.userId === currentUser.id);
      } else {
        userRequests = [...allRequests];
      }
    } catch (error) {
      console.error("Failed to parse stored requests:", error);
      allRequests = [];
      userRequests = [];
    }
  } else {
    allRequests = [];
    userRequests = [];
  }
  
  // Load notifications
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
}

function updateUI() {
  // Update navbar profile name
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = currentUser.firstName;
  }
  
  // Update notification badge
  updateNotificationBadge();
  
  // Update forms title based on user type
  const isStudent = currentUser.userType === "student";
  document.getElementById("formsTitle").textContent = isStudent 
    ? "Өргөдөл, хүсэлт илгээх" 
    : "Өргөдөл, хүсэлт хянах";
  
  // Show/hide request form for students/staff
  document.getElementById("requestForm").style.display = isStudent ? "block" : "none";
  
  // Filter requests by status
  const pendingRequests = userRequests.filter(req => req.status === "pending");
  const approvedRequests = userRequests.filter(req => req.status === "approved");
  const rejectedRequests = userRequests.filter(req => req.status === "rejected");
  
  // Update counts
  document.getElementById("pendingCount").textContent = pendingRequests.length > 0 ? `(${pendingRequests.length})` : "";
  document.getElementById("approvedCount").textContent = approvedRequests.length > 0 ? `(${approvedRequests.length})` : "";
  document.getElementById("rejectedCount").textContent = rejectedRequests.length > 0 ? `(${rejectedRequests.length})` : "";
  
  // Update request lists
  updateRequestList("pending", pendingRequests);
  updateRequestList("approved", approvedRequests);
  updateRequestList("rejected", rejectedRequests);
}

function updateRequestList(status, requests) {
  const listElement = document.getElementById(`${status}List`);
  const emptyElement = document.getElementById(`empty${status.charAt(0).toUpperCase() + status.slice(1)}`);
  
  if (requests.length === 0) {
    listElement.classList.add("hidden");
    emptyElement.classList.remove("hidden");
    return;
  }
  
  listElement.classList.remove("hidden");
  emptyElement.classList.add("hidden");
  
  // Sort requests by date (newest first)
  const sortedRequests = [...requests].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  // Clear list first
  listElement.innerHTML = "";
  
  // Create request items
  sortedRequests.forEach(request => {
    const requestElement = document.createElement("div");
    requestElement.className = "request-item";
    requestElement.setAttribute("data-id", request.id);
    
    // Format date
    const date = new Date(request.createdAt);
    const formattedDate = date.toLocaleDateString("mn-MN");
    
    // Get request type label
    const requestTypeLabel = REQUEST_TYPES[request.type] || request.type;
    
    // Build request item content
    requestElement.innerHTML = `
      <div class="request-header">
        <div>
          <h3 class="request-title">${request.title}</h3>
          <p class="request-meta">
            ${currentUser.userType === "staff" ? `Оюутны дугаар: ${request.userId} •` : `Төрөл: ${requestTypeLabel} •`} 
            Огноо: ${formattedDate}
          </p>
        </div>
        <span class="request-status status-${request.status}">
          ${getStatusLabel(request.status)}
        </span>
      </div>
      <div class="request-body">
        <p class="request-description">${request.description}</p>
        
        ${request.comments && request.comments.length > 0 ? `
          <div class="request-comments">
            <h4 class="comment-title">Тайлбар:</h4>
            <div class="comment-list">
              ${request.comments.map(comment => `
                <div class="comment-item">
                  <div class="comment-header">
                    <span class="comment-author">
                      ${comment.userFullName} (${comment.userType === "student" ? "Оюутан" : "Ажилтан"})
                    </span>
                    <span class="comment-date">
                      ${new Date(comment.createdAt).toLocaleString("mn-MN")}
                    </span>
                  </div>
                  <p>${comment.content}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="request-actions">
        ${getRequestActions(request)}
      </div>
    `;
    
    listElement.appendChild(requestElement);
    
    // Add event listeners for action buttons
    const commentBtns = requestElement.querySelectorAll(".comment-btn");
    commentBtns.forEach(btn => {
      btn.addEventListener("click", () => openCommentModal(request.id));
    });
    
    const approveBtns = requestElement.querySelectorAll(".approve-btn");
    approveBtns.forEach(btn => {
      btn.addEventListener("click", () => openActionModal(request.id, "approve"));
    });
    
    const rejectBtns = requestElement.querySelectorAll(".reject-btn");
    rejectBtns.forEach(btn => {
      btn.addEventListener("click", () => openActionModal(request.id, "reject"));
    });
  });
}

function getStatusLabel(status) {
  switch (status) {
    case "pending": return "Хүлээгдэж байна";
    case "approved": return "Батлагдсан";
    case "rejected": return "Татгалзсан";
    default: return "Тодорхойгүй";
  }
}

function getRequestActions(request) {
  const isStaff = currentUser.userType === "staff";
  const isPending = request.status === "pending";
  
  if (isStaff && isPending) {
    return `
      <button class="btn btn-danger reject-btn">Татгалзах</button>
      <div>
        <button class="btn btn-outline comment-btn">Тайлбар нэмэх</button>
        <button class="btn btn-success approve-btn">Зөвшөөрөх</button>
      </div>
    `;
  } else {
    return `
      <div class="ml-auto">
        <button class="btn btn-outline comment-btn">Тайлбар нэмэх</button>
      </div>
    `;
  }
}

function setupEventListeners() {
  // Request form submission
  const requestForm = document.getElementById("newRequestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", handleRequestSubmit);
  }
  
  // Tab switching
  const tabButtons = document.querySelectorAll(".request-tab");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const tabId = this.getAttribute("data-tab");
      
      // Remove active class from all tab buttons and panels
      document.querySelectorAll(".request-tab").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".request-panel").forEach(p => p.classList.remove("active"));
      
      // Add active class to selected tab button and panel
      this.classList.add("active");
      document.getElementById(`${tabId}Panel`).classList.add("active");
    });
  });
  
  // Modal close buttons
  document.getElementById("closeRequestModal").addEventListener("click", closeModal);
  document.getElementById("cancelModal").addEventListener("click", closeModal);
  
  // Save comment button
  document.getElementById("saveComment").addEventListener("click", handleSaveComment);
  
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

function handleRequestSubmit(e) {
  e.preventDefault();
  
  // Get form values
  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value.trim();
  
  // Validate form
  if (!title || !type || !description) {
    showToast("Алдаа", "Бүх талбарыг бөглөнө үү", "error");
    return;
  }
  
  // Create new request
  const now = new Date().toISOString();
  const newRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: currentUser.id,
    title,
    description,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    comments: [],
    type
  };
  
  // Add to requests
  allRequests.push(newRequest);
  
  // Save to localStorage
  localStorage.setItem("numforms_requests", JSON.stringify(allRequests));
  
  // Create notification for staff
  addNotification({
    userId: "STAFF001", // Mock staff ID
    title: "Шинэ өргөдөл",
    message: `${currentUser.firstName} оюутан шинээр өргөдөл илгээлээ`,
    isRead: false,
    relatedTo: {
      type: "request",
      id: newRequest.id
    }
  });
  
  // Reset form
  document.getElementById("title").value = "";
  document.getElementById("type").value = "";
  document.getElementById("description").value = "";
  
  // Reload data and update UI
  loadData();
  updateUI();
  
  // Show success message
  showToast("Амжилттай", "Таны өргөдөл амжилттай илгээгдлээ");
}

function openCommentModal(requestId) {
  currentRequestId = requestId;
  currentAction = "comment";
  
  // Set modal title
  document.getElementById("requestModalTitle").textContent = "Тайлбар нэмэх";
  
  // Clear textarea
  document.getElementById("commentText").value = "";
  
  // Show modal
  document.getElementById("requestModal").classList.remove("hidden");
}

function openActionModal(requestId, action) {
  currentRequestId = requestId;
  currentAction = action;
  
  // Set modal title
  if (action === "approve") {
    document.getElementById("requestModalTitle").textContent = "Өргөдөл батлах";
  } else if (action === "reject") {
    document.getElementById("requestModalTitle").textContent = "Өргөдөл татгалзах";
  }
  
  // Clear textarea
  document.getElementById("commentText").value = "";
  
  // Show modal
  document.getElementById("requestModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("requestModal").classList.add("hidden");
  currentRequestId = null;
  currentAction = null;
}

function handleSaveComment() {
  // Get comment text
  const commentText = document.getElementById("commentText").value.trim();
  
  // Validate comment
  if (!commentText) {
    showToast("Алдаа", "Тайлбар хоосон байж болохгүй", "error");
    return;
  }
  
  // Find request
  const requestIndex = allRequests.findIndex(req => req.id === currentRequestId);
  if (requestIndex === -1) {
    showToast("Алдаа", "Өргөдөл олдсонгүй", "error");
    closeModal();
    return;
  }
  
  // Create comment
  const comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestId: currentRequestId,
    userId: currentUser.id,
    userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
    userType: currentUser.userType,
    content: commentText,
    createdAt: new Date().toISOString()
  };
  
  // Add comment to request
  if (!allRequests[requestIndex].comments) {
    allRequests[requestIndex].comments = [];
  }
  
  allRequests[requestIndex].comments.push(comment);
  
  // Update status if needed
  if (currentAction === "approve") {
    allRequests[requestIndex].status = "approved";
    allRequests[requestIndex].updatedAt = new Date().toISOString();
  } else if (currentAction === "reject") {
    allRequests[requestIndex].status = "rejected";
    allRequests[requestIndex].updatedAt = new Date().toISOString();
  }
  
  // Save to localStorage
  localStorage.setItem("numforms_requests", JSON.stringify(allRequests));
  
  // Notify the other party
  const request = allRequests[requestIndex];
  const notifyUserId = currentUser.userType === "student" ? "STAFF001" : request.userId;
  let notificationTitle = "Тайлбар нэмэгдлээ";
  let notificationMessage = `Таны өргөдөлд ${currentUser.firstName}${currentUser.userType === 'staff' ? ' багш' : ''} тайлбар нэмлээ`;
  
  if (currentAction === "approve") {
    notificationTitle = "Өргөдөл батлагдлаа";
    notificationMessage = `Таны '${request.title}' батлагдлаа`;
  } else if (currentAction === "reject") {
    notificationTitle = "Өргөдөл татгалзлаа";
    notificationMessage = `Таны '${request.title}' татгалзлаа`;
  }
  
  addNotification({
    userId: notifyUserId,
    title: notificationTitle,
    message: notificationMessage,
    isRead: false,
    relatedTo: {
      type: "request",
      id: request.id
    }
  });
  
  // Close modal
  closeModal();
  
  // Reload data and update UI
  loadData();
  updateUI();
  
  // Show success message
  showToast("Амжилттай", currentAction === "comment" ? "Тайлбар нэмэгдлээ" : 
             currentAction === "approve" ? "Өргөдөл батлагдлаа" : "Өргөдөл татгалзлаа");
}

function addNotification(notification) {
  // Load existing notifications
  const storedNotifications = localStorage.getItem(`numforms_notifications_${notification.userId}`);
  let userNotifs = [];
  
  if (storedNotifications) {
    try {
      userNotifs = JSON.parse(storedNotifications);
    } catch (error) {
      console.error("Failed to parse stored notifications:", error);
      userNotifs = [];
    }
  }
  
  // Add new notification
  const newNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  userNotifs.unshift(newNotification);
  
  // Save to localStorage
  localStorage.setItem(`numforms_notifications_${notification.userId}`, JSON.stringify(userNotifs));
  
  // Update local notifications if it's for the current user
  if (notification.userId === currentUser.id) {
    loadData();
    updateNotificationBadge();
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
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

function showToast(title, message, type = "success") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type} fade-in`;
  
  toast.innerHTML = `
    <div class="toast-header">${title}</div>
    <div class="toast-body">${message}</div>
  `;
  
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
    min-width: 250px;
    max-width: 350px;
    background-color: var(--primary-color);
    color: white;
    border-radius: var(--radius);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    overflow: hidden;
  }
  
  .toast.success {
    background-color: var(--success);
  }
  
  .toast.error {
    background-color: var(--error);
  }
  
  .toast-header {
    padding: 0.5rem 1rem;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .toast-body {
    padding: 0.75rem 1rem;
  }
  
  .ml-auto {
    margin-left: auto;
  }
`;
document.head.appendChild(style);

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initFormsPage);

//qr

function generateQRCode(formData) {
  try {
    // Show loading state
    const qrCodeSection = document.getElementById('qrCodeSection');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const downloadBtn = document.getElementById('downloadQrBtn');
    
    qrCodeSection.classList.remove('hidden');
    qrCodeSection.innerHTML = '<p class="loading">QR код үүсгэж байна...</p>';
    
    // Create a view URL for this submission
    const baseUrl = window.location.origin;
    const viewUrl = `${baseUrl}/view-submission.html?id=${encodeURIComponent(formData.id)}`;
    
    // Generate QR code using GoQR API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(viewUrl)}&size=200x200&format=png&margin=10`;
    
    // Create the QR code display
    qrCodeSection.innerHTML = `
      <h3>Таны өргөдлийн QR код</h3>
      <div class="qr-code-wrapper">
        <img id="qrCodeImage" src="${qrApiUrl}" alt="QR Code" />
      </div>
      <p class="qr-instructions">Энэ QR кодыг хадгалаарай. Өргөдлийн төлөвийг хянах боломжтой.</p>
      <button id="downloadQrBtn" class="btn btn-secondary">QR кодыг татах</button>
    `;
    
    // Get the new elements after re-rendering
    const newQrCodeImage = document.getElementById('qrCodeImage');
    const newDownloadBtn = document.getElementById('downloadQrBtn');
    
    // Handle QR code load errors
    newQrCodeImage.onerror = () => {
      qrCodeSection.innerHTML = '<p class="error">QR код үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.</p>';
      console.error("Failed to load QR code image");
    };
    
    // Set up download functionality
    newDownloadBtn.addEventListener('click', () => {
      downloadQRCode(qrApiUrl, `numforms-submission-${formData.id}.png`);
    });
    
    return viewUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    document.getElementById('qrCodeSection').innerHTML = '<p class="error">QR код үүсгэхэд алдаа гарлаа.</p>';
    return null;
  }
}

function downloadQRCode(src, filename) {
  try {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download QR code:", error);
    showToast("Алдаа", "QR кодыг татахад алдаа гарлаа", "error");
  }
}

function handleRequestSubmit(e) {
  e.preventDefault();
  
  // Get form values
  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value.trim();
  
  // Validate form
  if (!title || !type || !description) {
    showToast("Алдаа", "Бүх талбарыг бөглөнө үү", "error");
    return;
  }
  
  // Create new request
  const now = new Date().toISOString();
  const newRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: currentUser.id,
    title,
    description,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    comments: [],
    type
  };
  
  // Add to requests
  allRequests.push(newRequest);
  
  // Save to localStorage
  localStorage.setItem("numforms_requests", JSON.stringify(allRequests));
  
  // Generate and display QR code
  generateQRCode(newRequest);
  
  // Create notification for staff
  addNotification({
    userId: "STAFF001", // Mock staff ID
    title: "Шинэ өргөдөл",
    message: `${currentUser.firstName} оюутан шинээр өргөдөл илгээлээ`,
    isRead: false,
    relatedTo: {
      type: "request",
      id: newRequest.id
    }
  });
  
  // Reset form
  document.getElementById("newRequestForm").reset();
  
  // Reload data and update UI
  loadData();
  updateUI();
  
  // Show success message
  showToast("Амжилттай", "Таны өргөдөл амжилттай илгээгдлээ");
  
  // Scroll to QR code
  document.getElementById('qrCodeSection').scrollIntoView({ behavior: 'smooth' });
}
