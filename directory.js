// Directory Page JavaScript

// State management
let currentUser = null;
let userNotifications = [];
let staffDirectory = [];

// Mock data for staff directory
const STAFF_DIRECTORY = [
  {
    id: "staff1",
    firstName: "Намжил",
    lastName: "Доржсүрэн",
    position: "Багш",
    department: "Мэдээллийн Технологийн Тэнхим",
    email: "namjil.d@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1101",
    officeRoom: "Хичээлийн байр 2 - 201",
  },
  {
    id: "staff2",
    firstName: "Оюунтулга",
    lastName: "Батболд",
    position: "Дэд захирал",
    department: "Захиргаа, Аж Ахуйн Алба",
    email: "oyuntulga.b@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1001",
    officeRoom: "Хичээлийн байр 1 - 101",
  },
  {
    id: "staff3",
    firstName: "Мөнхзул",
    lastName: "Бямбаа",
    position: "Ахлах багш",
    department: "Инженерчлэлийн Тэнхим",
    email: "munkhzul.b@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1103",
    officeRoom: "Хичээлийн байр 3 - 305",
  },
  {
    id: "staff4",
    firstName: "Энхтуяа",
    lastName: "Сүхбаатар",
    position: "Сургалтын Менежер",
    department: "Сургалтын Алба",
    email: "enkhtuya.s@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1104",
    officeRoom: "Хичээлийн байр 1 - 210",
  },
  {
    id: "staff5",
    firstName: "Амарбаясгалан",
    lastName: "Мөнх",
    position: "Албаны дарга",
    department: "Оюутны Үйлчилгээ, Соёлын Төв",
    email: "amarbayasgalan.m@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1105",
    officeRoom: "Хичээлийн байр 4 - 112",
  },
  {
    id: "staff6",
    firstName: "Батбаяр",
    lastName: "Ганболд",
    position: "Профессор",
    department: "Физикийн тэнхим",
    email: "batbayar.g@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1121",
    officeRoom: "Хичээлийн байр 7 - 114",
  },
  {
    id: "staff7",
    firstName: "Сарантуяа",
    lastName: "Отгонбаяр",
    position: "Ахлах нягтлан бодогч",
    department: "Санхүү, Эдийн Засгийн Алба",
    email: "sarantuya.o@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1005",
    officeRoom: "Хичээлийн байр 1 - 303",
  },
  {
    id: "staff8",
    firstName: "Тэмүүлэн",
    lastName: "Эрдэнэ",
    position: "Хүний Нөөцийн Мэргэжилтэн",
    department: "Хүний Нөөцийн Алба",
    email: "temuulen.e@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1010",
    officeRoom: "Хичээлийн байр 1 - 205",
  },
  {
    id: "staff9",
    firstName: "Ариунзаяа",
    lastName: "Цэцэгмаа",
    position: "Ахлах номын санч",
    department: "Номын сан, Мэдээллийн Төв",
    email: "ariunzaya.ts@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1135",
    officeRoom: "Хичээлийн байр 6 - 102",
  },
  {
    id: "staff10",
    firstName: "Чингүүн",
    lastName: "Болдбаатар",
    position: "Системийн администратор",
    department: "Мэдээллийн Технологийн Тэнхим",
    email: "chinguun.b@num.edu.mn", // Шинэчилсэн
    phone: "77307730 - 1150",
    officeRoom: "Хичээлийн байр 2 - 115",
  }
];

// console.log(STAFF_DIRECTORY);

// DOM Functions
function initDirectoryPage() {
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
  // Set staff directory (in a real app, this would be loaded from backend)
  staffDirectory = STAFF_DIRECTORY;
  
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
  
  // Render staff directory
  renderStaffDirectory(staffDirectory);
}

// Directory Page JavaScript (Таны одоогийн кодын хэсэг)

// ... (STAFF_DIRECTORY болон бусад функцууд хэвээрээ) ...

function renderStaffDirectory(staff) {
  const directoryElement = document.getElementById("staffDirectory");
  const emptySearchElement = document.getElementById("emptySearch");
  
  if (!directoryElement || !emptySearchElement) {
    console.error("Directory or empty search element not found in the DOM.");
    return;
  }
  
  if (staff.length === 0) {
    directoryElement.classList.add("hidden");
    emptySearchElement.classList.remove("hidden");
    return;
  }
  
  directoryElement.classList.remove("hidden");
  emptySearchElement.classList.add("hidden");
  
  // Clear directory first
  directoryElement.innerHTML = "";
  
  // Create staff cards
  staff.forEach(person => {
    const staffCard = document.createElement("div");
    staffCard.className = "staff-card";
    
    // Суудаг өрөөний мэдээллийг нэмэх SVG icon (жишээ нь, map-pin)
    const officeRoomHTML = person.officeRoom ? `
      <div class="info-item">
        <svg class="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${person.officeRoom}</span>
      </div>` : '';

    staffCard.innerHTML = `
      <div class="staff-header">
        <h3 class="staff-name">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          ${person.lastName} ${person.firstName}
        </h3>
      </div>
      <div class="staff-body">
        <div class="staff-info">
          <div class="info-item">
            <svg class="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect> {/* Энэ icon нь "Албан тушаал, Хэлтэс" байж магадгүй */}
              <path d="M20 8H4"></path>
              <path d="M6 12h.01"></path><path d="M10 12h.01"></path><path d="M14 12h.01"></path><path d="M18 12h.01"></path>
              <path d="M6 16h.01"></path><path d="M10 16h.01"></path><path d="M14 16h.01"></path><path d="M18 16h.01"></path>
            </svg>
            <span>${person.position}, ${person.department}</span>
          </div>
          <div class="info-item">
            <svg class="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <a href="mailto:${person.email}" class="info-link">${person.email}</a>
          </div>
          <div class="info-item">
            <svg class="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <a href="tel:${person.phone.replace(/\s-\s/g, '')}" class="info-link">${person.phone}</a> 
          </div>
          ${officeRoomHTML}
        </div>
      </div>
    `;
    
    directoryElement.appendChild(staffCard);
  });
}

// ... (бусад функцууд: setupEventListeners, handleSearch, updateNotificationBadge, toggleMobileMenu, handleLogout, initDirectoryPage хэвээрээ) ...

// Initialize page when DOM is loaded
// document.addEventListener("DOMContentLoaded", initDirectoryPage); // Энэ мөр хэвээрээ байх ёстой


function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById("searchStaff");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
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

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    renderStaffDirectory(staffDirectory);
    return;
  }
  
  const filteredStaff = staffDirectory.filter(person => {
    return (
      person.firstName.toLowerCase().includes(searchTerm) ||
      person.lastName.toLowerCase().includes(searchTerm) ||
      person.position.toLowerCase().includes(searchTerm) ||
      person.department.toLowerCase().includes(searchTerm)
    );
  });
  
  renderStaffDirectory(filteredStaff);
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

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initDirectoryPage);
