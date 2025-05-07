// script.js - Нүүр хуудасны JavaScript (Нэгтгэсэн ба Шинэчилсэн)

// Constants and MOCK data (Хамгийн сүүлд шинэчилсэн хувилбар)
const MOCK_STUDENT = {
  id: "20B1NUM1234",
  firstName: "Золжаргал",
  lastName: "Батсүрэн",
  email: "20B1NUM1234@stud.num.edu.mn",
  phone: "99112233",
  userType: "student",
  faculty: "Мэдээллийн технологи, электроникийн сургууль",
  department: "Програм хангамжийн инженерийн тэнхим",
  program: "Програм хангамж",
  level: "3-р курс",
  nationalId: "АБ00112233",
  gender: "эрэгтэй",
  registeredDate: "2022-09-01",
  photoUrl: null
};

const MOCK_STAFF = {
  id: "STAFF001",
  firstName: "Намжил",
  lastName: "Доржсүрэн",
  email: "namjil.d@num.edu.mn",
  phone: "77307730 - 1101",
  userType: "staff",
  faculty: "Мэдээллийн технологи, электроникийн сургууль",
  department: "Мэдээллийн технологийн тэнхим",
  position: "Багш",
  officeRoom: "Хичээлийн байр 2 - 201",
  nationalId: "УЕ80010111",
  gender: "эрэгтэй",
  registeredDate: "2018-01-15",
  photoUrl: null
};

const MOCK_NOTIFICATIONS = [
  {
    id: "notif1", userId: MOCK_STUDENT.id, title: "Өргөдөл батлагдлаа",
    message: `Таны 'Хичээл цуцлах өргөдөл' (${MOCK_STUDENT.lastName.charAt(0)}.${MOCK_STUDENT.firstName}) батлагдлаа.`,
    isRead: false, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    relatedTo: { type: "request", id: "req1" }
  },
  {
    id: "notif2", userId: MOCK_STUDENT.id, title: "Тайлбар нэмэгдлээ",
    message: `Таны өргөдөлд ${MOCK_STAFF.lastName.charAt(0)}.${MOCK_STAFF.firstName} багш тайлбар нэмлээ.`,
    isRead: true, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    relatedTo: { type: "request", id: "req2" }
  },
  {
    id: "notif3", userId: MOCK_STAFF.id, title: "Шинэ өргөдөл ирлээ",
    message: `${MOCK_STUDENT.lastName.charAt(0)}.${MOCK_STUDENT.firstName} (${MOCK_STUDENT.id}) оюутан шинээр 'Дүнгийн маргаан' өргөдөл илгээлээ.`,
    isRead: false, createdAt: new Date().toISOString(),
    relatedTo: { type: "request", id: "req3" }
  },
  {
    id: "notif4", userId: MOCK_STUDENT.id, title: "Системийн мэдэгдэл",
    message: "2024-2025 оны хичээлийн жилийн хаврын улирлын сургалтын төлбөр төлөх хугацаа сунгагдлаа.",
    isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), relatedTo: null
  }
];

const MOCK_REQUESTS = [ // Энэ нь `numforms_all_requests` нэрээр localStorage-д хадгалагдана
  {
    id: "req1", studentId: MOCK_STUDENT.id, title: "Хичээл цуцлах өргөдөл",
    description: "Биеийн байдлын улмаас CS202 - Өгөгдлийн бүтэц хичээлээс чөлөөлөгдөхийг хүсэж байна.",
    type: "course_cancellation", status: "APPROVED",
    submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    comments: [{ id: "comment1_req1", authorId: MOCK_STAFF.id, authorName: `${MOCK_STAFF.lastName.charAt(0)}. ${MOCK_STAFF.firstName}`, authorRole: "staff", text: "Хүсэлтийг зөвшөөрч, хичээлээс чөлөөллөө.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }]
  },
  {
    id: "req2", studentId: MOCK_STUDENT.id, title: "Төлбөрийн буцаалт хүсэх",
    description: "CS202 хичээлээс чөлөөлөгдсөн тул урьдчилж төлсөн төлбөрийг буцаан олгохыг хүсэж байна.",
    type: "refund_request", status: "PENDING",
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), comments: []
  },
  {
    id: "req3", studentId: MOCK_STUDENT.id, title: "Дүнгийн маргаан",
    description: "MATH101 хичээлийн явцын шалгалтын дүн дээр маргаантай байна. Дахин нягталж өгнө үү.",
    type: "grade_dispute_complaint", status: "REJECTED",
    submittedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    comments: [{ id: "comment1_req3", authorId: MOCK_STAFF.id, authorName: `${MOCK_STAFF.lastName.charAt(0)}. ${MOCK_STAFF.firstName}`, authorRole: "staff", text: "Дүнг холбогдох журмын дагуу нягтлан шалгахад зөрчилгүй байсан тул хүсэлтээс татгалзлаа.", timestamp: new Date(Date.now() - 25 * 86400000).toISOString() }]
  }
];

// State management
let currentUser = null;
let userNotifications = []; // Тухайн хэрэглэгчийн мэдэгдлүүд
let allRequestsGlobal = []; // Бүх өргөдөл (request.js-д ID-аар хайхад ашиглана)
let userRequests = []; // Тухайн хэрэглэгчийн өргөдлүүд (forms.html-д харуулахад)


// DOM Functions
function initApp() {
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      // localStorage-д хадгалагдсан currentUser нь бүх талбарыг агуулаагүй байж магадгүй тул
      // MOCK өгөгдлөөс дэлгэрэнгүй мэдээллийг нөхөж авна (зөвхөн mock орчинд).
      if (currentUser.userType === 'student') {
          const studentDetails = (MOCK_STUDENT.id === currentUser.id) ? MOCK_STUDENT : createStudentFromStored(currentUser);
          currentUser = {...studentDetails, ...currentUser}; // Оршин байгаа утгыг дарж бичихгүй, нөхнө
      } else if (currentUser.userType === 'staff') {
          const staffDetails = (MOCK_STAFF.id === currentUser.id) ? MOCK_STAFF : createStaffFromStored(currentUser);
          currentUser = {...staffDetails, ...currentUser};
      }
      // localStorage-г шинэчилсэн currentUser-ээр хадгалах нь сайн практик
      localStorage.setItem("numforms_user", JSON.stringify(currentUser));

      loadUserData();
      showAuthenticatedUI();
    } catch (error) {
      console.error("Хадгалагдсан хэрэглэгчийн мэдээлэл уншихад алдаа гарлаа:", error);
      localStorage.removeItem("numforms_user");
      showLoginUI();
    }
  } else {
    showLoginUI();
  }
  setupEventListeners();
}

function createStudentFromStored(storedMinUser) {
    return {
        ...MOCK_STUDENT, // MOCK_STUDENT-ийг суурь болгоно
        id: storedMinUser.id, // localStorage-аас авсан ID-г дарж бичнэ
        firstName: storedMinUser.firstName,
        lastName: storedMinUser.lastName,
        email: storedMinUser.email || `${storedMinUser.id}@stud.num.edu.mn`, // Имэйл байхгүй бол үүсгэнэ
        // photoUrl, registeredDate зэргийг MOCK_STUDENT-ээс авна
    };
}
function createStaffFromStored(storedMinUser) {
     return {
        ...MOCK_STAFF, // MOCK_STAFF-ийг суурь болгоно
        id: storedMinUser.id,
        firstName: storedMinUser.firstName,
        lastName: storedMinUser.lastName,
        email: storedMinUser.email || `${storedMinUser.firstName.toLowerCase().charAt(0)}.${storedMinUser.lastName.toLowerCase()}@num.edu.mn`,
    };
}

function loadUserData() {
  if (!currentUser) return;

  // Load notifications
  const storedUserNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
  if (storedUserNotifications) {
      try {
          userNotifications = JSON.parse(storedUserNotifications);
      } catch(e) {
          console.warn("Хэрэглэгчийн мэдэгдлийг уншихад алдаа гарлаа, mock ашиглаж байна.", e);
          userNotifications = MOCK_NOTIFICATIONS.filter(n => n.userId === currentUser.id);
          localStorage.setItem(`numforms_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
      }
  } else {
      userNotifications = MOCK_NOTIFICATIONS.filter(n => n.userId === currentUser.id);
      localStorage.setItem(`numforms_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
  }

  // Load ALL requests (for request detail page lookup)
  const storedAllRequests = localStorage.getItem("numforms_all_requests"); // Нэрийг өөрчилсөн
  if (storedAllRequests) {
      try {
          allRequestsGlobal = JSON.parse(storedAllRequests);
      } catch(e) {
          console.warn("Бүх өргөдлийг уншихад алдаа гарлаа, mock ашиглаж байна.", e);
          allRequestsGlobal = MOCK_REQUESTS; // MOCK_REQUESTS-ийг бүх өргөдлийн анхны утга болгоно
          localStorage.setItem("numforms_all_requests", JSON.stringify(allRequestsGlobal));
      }
  } else {
      allRequestsGlobal = MOCK_REQUESTS;
      localStorage.setItem("numforms_all_requests", JSON.stringify(allRequestsGlobal));
  }
  
  // Filter user-specific requests (for forms.html display)
  if (currentUser.userType === 'student') {
      userRequests = allRequestsGlobal.filter(req => req.studentId === currentUser.id);
  } else if (currentUser.userType === 'staff' || currentUser.userType === 'admin') { // Админ нэмэгдвэл
      userRequests = allRequestsGlobal; // Ажилтан/Админ бүх хүсэлтийг харах боломжтой (forms.html дээр)
  } else {
      userRequests = [];
  }

  updateNotificationBadge();
}

function setupEventListeners() {
  const tabButtons = document.querySelectorAll(".login-card .tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const tabId = this.getAttribute("data-tab");
      document.querySelectorAll(".login-card .tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".login-card .tab-pane").forEach(p => p.classList.remove("active"));
      this.classList.add("active");
      const targetPane = document.getElementById(`${tabId}-tab`);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }
}

function handleLogin(event) {
  event.preventDefault(); // Форм submit хийхээс сэргийлнэ
  const activeTabPane = document.querySelector(".login-card .tab-pane.active");
  if (!activeTabPane) {
    alert("Нэвтрэх төрлөө (Оюутан/Ажилтан) сонгоогүй байна. Табыг сонгоно уу.");
    return;
  }

  const userType = activeTabPane.id === "student-tab" ? "student" : "staff";
  let enteredId, enteredPassword;
  let targetMockUser;

  if (userType === "student") {
    enteredId = document.getElementById("student-id")?.value;
    enteredPassword = document.getElementById("student-password")?.value;
    targetMockUser = MOCK_STUDENT;
  } else { // staff
    enteredId = document.getElementById("staff-id")?.value;
    enteredPassword = document.getElementById("staff-password")?.value;
    targetMockUser = MOCK_STAFF;
  }

  if (!enteredId) {
      alert("Нэвтрэх ID-аа оруулна уу.");
      return;
  }

  // ID-г шалгах (Нууц үгийг энэ mock системд шалгахгүй)
  if (enteredId === targetMockUser.id) {
    currentUser = JSON.parse(JSON.stringify(targetMockUser)); // MOCK өгөгдлийг хуулбарлаж авна
    localStorage.setItem("numforms_user", JSON.stringify(currentUser));
    
    loadUserData(); // Мэдэгдэл, өргөдлийг ачаална
    showAuthenticatedUI(); // Нэвтэрсэн үеийн UI-г харуулна
  } else {
    alert(`${userType === "student" ? "Оюутны дугаар" : "Ажилтны дугаар"} буруу байна. Дахин шалгана уу.`);
  }
}

function handleLogout() {
  localStorage.removeItem("numforms_user");
  // Холбогдох бусад локал хадгаламжийг цэвэрлэж болно.
  // Жишээ нь, хэрэглэгч бүрийн мэдэгдлийг цэвэрлэх:
  // if(currentUser && currentUser.id) { // currentUser null болоогүй үед
  //   localStorage.removeItem(`numforms_notifications_${currentUser.id}`);
  // }
  currentUser = null;
  userNotifications = [];
  userRequests = [];
  allRequestsGlobal = []; // Үүнийг ч цэвэрлэх нь зүйтэй
  
  showLoginUI();
}

function toggleMobileMenu() {
  const navLinks = document.getElementById("navLinks");
  if (navLinks) navLinks.classList.toggle("active");
}

function showLoginUI() {
  const loginContainer = document.getElementById("loginContainer");
  const homeContainer = document.getElementById("homeContainer");
  const navActions = document.querySelector(".nav-actions");

  if (loginContainer) loginContainer.classList.remove("hidden");
  if (homeContainer) homeContainer.classList.add("hidden");
  
  if (navActions) {
    navActions.style.display = "none";
  }

  // Талбаруудыг цэвэрлэх
  const studentIdInput = document.getElementById("student-id");
  if (studentIdInput) studentIdInput.value = "";
  const studentPasswordInput = document.getElementById("student-password");
  if (studentPasswordInput) studentPasswordInput.value = "";
  const staffIdInput = document.getElementById("staff-id");
  if (staffIdInput) staffIdInput.value = "";
  const staffPasswordInput = document.getElementById("staff-password");
  if (staffPasswordInput) staffPasswordInput.value = "";

  // Нэвтрэх таб-г анхны байдалд нь оруулж болно (Оюутан таб идэвхтэй)
  const studentTabBtn = document.querySelector(".login-card .tab-btn[data-tab='student']");
  const staffTabBtn = document.querySelector(".login-card .tab-btn[data-tab='staff']");
  const studentTabPane = document.getElementById("student-tab");
  const staffTabPane = document.getElementById("staff-tab");

  if (studentTabBtn && staffTabBtn && studentTabPane && staffTabPane) {
    studentTabBtn.classList.add("active");
    staffTabBtn.classList.remove("active");
    studentTabPane.classList.add("active");
    staffTabPane.classList.remove("active");
  }
}

function showAuthenticatedUI() {
  const loginContainer = document.getElementById("loginContainer");
  const homeContainer = document.getElementById("homeContainer");
  const navActions = document.querySelector(".nav-actions");

  if (loginContainer) loginContainer.classList.add("hidden");
  if (homeContainer) homeContainer.classList.remove("hidden");

  if (navActions) {
    navActions.style.display = "flex";
  }
  
  const profileName = document.getElementById("profileName");
  if (profileName && currentUser) {
    profileName.textContent = currentUser.firstName;
  }
  
  const welcomeTitle = document.getElementById("welcomeTitle");
  if (welcomeTitle && currentUser) {
    welcomeTitle.textContent = `Тавтай морил, ${currentUser.firstName}!`;
  }

  const requestServiceDescription = document.getElementById("requestServiceDescription");
  if (requestServiceDescription && currentUser) {
    requestServiceDescription.textContent = currentUser.userType === "student" 
      ? "Өөрийн илгээсэн өргөдлүүдийг хянах, шинээр өргөдөл гаргах боломжтой."
      : "Танд ирсэн оюутнуудын өргөдлүүдийг хянан үзэж, шийдвэрлэх боломжтой.";
  }
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (badge && currentUser) { // currentUser байгаа эсэхийг шалгах
    // userNotifications нь loadUserData() дотор currentUser-т зориулж үүссэн байх ёстой
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    badge.textContent = unreadCount > 0 ? unreadCount : ""; // Тоо 0 байвал хоосон харагдуулна
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  } else if (badge) {
    badge.style.display = "none"; // Хэрэглэгч байхгүй бол нуух
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);


