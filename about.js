// About Page JavaScript

// State management
let currentUser = null;
let userNotifications = [];

// DOM Functions
function initAboutPage() {
  // Check if user is logged in
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      loadNotifications();
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

function loadNotifications() {
  // Load notifications from localStorage
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
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function setupEventListeners() {
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

// Google Maps initialization
function initMap() {
  // Coordinates for Ulaanbaatar, Mongolia (city center)
  const ulaanbaatar = { lat: 47.92029609404401, lng: 106.92744429199034 }; 

  // Create a map centered at Ulaanbaatar
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: ulaanbaatar,
  });

  // Add a marker at Ulaanbaatar
  new google.maps.Marker({
    position: ulaanbaatar,
    map: map,
    title: "NumForms - Улаанбаатар",
  });
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initAboutPage);