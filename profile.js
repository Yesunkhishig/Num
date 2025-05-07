// Profile Page JavaScript

// State management
let currentUser = null;

// DOM Functions
function initProfilePage() {
  // Check if user is logged in
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      updateProfileUI();
      loadNotifications();
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

// profile.js файл доторх updateProfileUI функцийн хэсэг

function updateProfileUI() {
  if (!currentUser) return; // currentUser байгаа эсэхийг шалгах

  // Update navbar profile name
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = currentUser.firstName || "Хэрэглэгч";
  }
  
  // Update profile header
  document.getElementById("fullName").textContent = `${currentUser.lastName || ""} ${currentUser.firstName || ""}`;
  document.getElementById("profileId").textContent = 
    `${currentUser.userType === "student" ? "Оюутны код" : "Ажилтны код"}: ${currentUser.id || "N/A"}`;
  
  // Update profile details
  const profileDetails = document.getElementById("profileDetails");
  // currentUser объектод талбарууд байхгүй бол "N/A" гэж харуулахаар тохируулсан.
  profileDetails.innerHTML = `
    <div class="profile-label">Овог:</div>
    <div class="profile-value">${currentUser.lastName || "N/A"}</div>

    <div class="profile-label">Нэр:</div>
    <div class="profile-value">${currentUser.firstName || "N/A"}</div>
    
    <div class="profile-label">Утас:</div>
    <div class="profile-value">${currentUser.phone || "N/A"}</div>
    
    <div class="profile-label">Имэйл:</div>
    <div class="profile-value">${currentUser.email || "N/A"}</div>

    
  `; // Эндэх ; (семиколон) тэмдгийг арилгаад += хийхэд бэлдэнэ
  
  // Add user type specific fields
  if (currentUser.userType === "student") {
    profileDetails.innerHTML += `
      <div class="profile-label">Салбар сургууль:</div>
      <div class="profile-value">${currentUser.faculty || "N/A"}</div> 
      {/* Таны өмнөх currentUser.school-г currentUser.faculty болгосон. MOCK өгөгдөлтэй нийцүүлнэ үү. */}

      <div class="profile-label">Тэнхим:</div>
      <div class="profile-value">${currentUser.department || "N/A"}</div>
      
      <div class="profile-label">Хөтөлбөр:</div>
      <div class="profile-value">${currentUser.program || "N/A"}</div>

      <div class="profile-label">Курс/Түвшин:</div>
      <div class="profile-value">${currentUser.level || "N/A"}</div>
    `;
  } else if (currentUser.userType === "staff") {
    profileDetails.innerHTML += `
      <div class="profile-label">Салбар сургууль:</div>
      <div class="profile-value">${currentUser.faculty || "N/A"}</div>

      <div class="profile-label">Тэнхим/Алба:</div>
      <div class="profile-value">${currentUser.department || "N/A"}</div>
      
      <div class="profile-label">Албан тушаал:</div>
      <div class="profile-value">${currentUser.position || "N/A"}</div>

      <div class="profile-label">Суудаг өрөө:</div>
      <div class="profile-value">${currentUser.officeRoom || "N/A"}</div>
    `;
  }
}

function loadNotifications() {
  // Load notifications from localStorage
  const storedNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
  let userNotifications = [];
  
  if (storedNotifications) {
    try {
      userNotifications = JSON.parse(storedNotifications);
    } catch (error) {
      console.error("Failed to parse stored notifications:", error);
    }
  }
  
  // Update notification badge
  updateNotificationBadge(userNotifications);
}

function updateNotificationBadge(notifications) {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function setupEventListeners() {
  // Edit profile button
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", showEditProfileModal);
  }
  
  // Close profile modal button
  const closeProfileModal = document.getElementById("closeProfileModal");
  if (closeProfileModal) {
    closeProfileModal.addEventListener("click", hideEditProfileModal);
  }
  
  // Cancel edit profile button
  const cancelEditProfile = document.getElementById("cancelEditProfile");
  if (cancelEditProfile) {
    cancelEditProfile.addEventListener("click", hideEditProfileModal);
  }
  
  // Save profile button
  const saveProfile = document.getElementById("saveProfile");
  if (saveProfile) {
    saveProfile.addEventListener("click", saveProfileChanges);
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

function showEditProfileModal() {
  // Set current values in form
  document.getElementById("firstName").value = currentUser.firstName;
  document.getElementById("lastName").value = currentUser.lastName;
  document.getElementById("email").value = currentUser.email;
  document.getElementById("phone").value = currentUser.phone;
  
  // Show modal
  document.getElementById("editProfileModal").classList.remove("hidden");
}

function hideEditProfileModal() {
  document.getElementById("editProfileModal").classList.add("hidden");
}

function saveProfileChanges() {
  // Get form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  
  // Validate form (simple validation)
  if (!firstName || !lastName || !email || !phone) {
    alert("Бүх талбарыг бөглөнө үү");
    return;
  }
  
  // Update currentUser
  currentUser.firstName = firstName;
  currentUser.lastName = lastName;
  currentUser.email = email;
  currentUser.phone = phone;
  
  // Save to localStorage
  localStorage.setItem("numforms_user", JSON.stringify(currentUser));
  
  // Update UI
  updateProfileUI();
  
  // Hide modal
  hideEditProfileModal();
  
  // Show success message
  showToast("Профайл амжилттай шинэчлэгдлээ");
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
document.addEventListener("DOMContentLoaded", initProfilePage);