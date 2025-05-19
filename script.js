(function() {
  emailjs.init("EtCJuHdOYe-hI94IB");
})();

const MOCK_STUDENT = {
id: "20B1NUM1799",
firstName: "Есөнхишиг",
lastName: "Төмөрбаатар",
email: "20B1NUM1799@stud.num.edu.mn",
phone: "99112233",
userType: "student",
faculty: "Мэдээллийн технологи, электроникийн сургууль",
department: "Програм хангамжийн инженерийн тэнхим",
program: "Мэдээллийн технологи",
level: "3-р курс",
nationalId: "АБ00112233",
gender: "эмэгтэй",
registeredDate: "2022-09-01",
photoUrl: null
};

const MOCK_STAFF = {
id: "STAFF001",
firstName: "Буянхишиг",
lastName: "Төртогтох",
email: "20B1NUM1799@stud.num.edu.mn",
phone: "77307730 - 1101",
userType: "staff",
faculty: "Мэдээллийн технологи, электроникийн сургууль",
department: "Мэдээллийн технологийн тэнхим",
position: "Тэнхимийн туслах",
officeRoom: "Хичээлийн байр 2 - 201",
nationalId: "УЕ80010111",
gender: "эмэгтэй",
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

const MOCK_REQUESTS = [
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
const requests = [
  {
    id: 'req_001',
    userId: 'STUD001',
    title: 'Тестын өргөдөл 1',
    type: 'custom_request',
    description: 'Туршилтын өргөдөл',
    status: 'approved',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-02').toISOString(),
    comments: [{ userFullName: 'Админ', content: 'Баталлаа', createdAt: new Date().toISOString() }]
  },
  {
    id: 'req_002',
    userId: 'STUD002',
    title: 'Тестын өргөдөл 2',
    type: 'refund_request',
    formUrl: 'https://form.jotform.com/251119434684459',
    status: 'rejected',
    createdAt: new Date('2025-05-03').toISOString(),
    updatedAt: new Date('2025-05-04').toISOString(),
    comments: [{ userFullName: 'Админ', content: 'Татгалзлаа', createdAt: new Date().toISOString() }]
  }
];
localStorage.setItem('numforms_requests', JSON.stringify(requests));

let currentUser = null;
let userNotifications = [];
let allRequestsGlobal = [];
let userRequests = [];

function initApp() {
const storedUser = localStorage.getItem("numforms_user");
if (storedUser) {
  try {
    currentUser = JSON.parse(storedUser);
    if (currentUser.userType === 'student') {
      const studentDetails = (MOCK_STUDENT.id === currentUser.id) ? MOCK_STUDENT : createStudentFromStored(currentUser);
      currentUser = {...studentDetails, ...currentUser};
    } else if (currentUser.userType === 'staff') {
      const staffDetails = (MOCK_STAFF.id === currentUser.id) ? MOCK_STAFF : createStaffFromStored(currentUser);
      currentUser = {...staffDetails, ...currentUser};
    }
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
  ...MOCK_STUDENT,
  id: storedMinUser.id,
  firstName: storedMinUser.firstName,
  lastName: storedMinUser.lastName,
  email: storedMinUser.email || `${storedMinUser.id}@stud.num.edu.mn`
};
}

function createStaffFromStored(storedMinUser) {
return {
  ...MOCK_STAFF,
  id: storedMinUser.id,
  firstName: storedMinUser.firstName,
  lastName: storedMinUser.lastName,
  email: storedMinUser.email || `${storedMinUser.firstName.toLowerCase().charAt(0)}.${storedMinUser.lastName.toLowerCase()}@num.edu.mn`
};
}

function loadUserData() {
if (!currentUser) return;

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

const storedAllRequests = localStorage.getItem("numforms_all_requests");
if (storedAllRequests) {
  try {
    allRequestsGlobal = JSON.parse(storedAllRequests);
  } catch(e) {
    console.warn("Бүх өргөдлийг уншихад алдаа гарлаа, mock ашиглаж байна.", e);
    allRequestsGlobal = MOCK_REQUESTS;
    localStorage.setItem("numforms_all_requests", JSON.stringify(allRequestsGlobal));
  }
} else {
  allRequestsGlobal = MOCK_REQUESTS;
  localStorage.setItem("numforms_all_requests", JSON.stringify(allRequestsGlobal));
}

if (currentUser.userType === 'student') {
  userRequests = allRequestsGlobal.filter(req => req.studentId === currentUser.id);
} else if (currentUser.userType === 'staff' || currentUser.userType === 'admin') {
  userRequests = allRequestsGlobal;
} else {
  userRequests = [];
}

updateNotificationBadge();
}

function setupEventListeners() {
const tabButtons = document.querySelectorAll(".login-card .tab-btn");
if (tabButtons.length === 0) {
  console.error("No tab buttons found. Please check HTML for '.login-card .tab-btn' elements.");
  return;
}
tabButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const tabId = this.getAttribute("data-tab");
    if (!tabId) {
      console.error("Tab button missing 'data-tab' attribute:", btn);
      return;
    }
    document.querySelectorAll(".login-card .tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".login-card .tab-pane").forEach(p => p.classList.remove("active"));
    this.classList.add("active");
    const targetPane = document.getElementById(`${tabId}-tab`);
    if (targetPane) {
      targetPane.classList.add("active");
    } else {
      console.error(`Tab pane with ID '${tabId}-tab' not found.`);
    }
  });
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
} else {
  console.warn("Logout button not found.");
}

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", toggleMobileMenu);
} else {
  console.warn("Mobile menu button not found.");
}
}

function sendVerificationCode(role) {
const emailInput = document.getElementById(`${role}-email`);
const errorElement = document.getElementById(`${role}-error`);
const codeSection = document.getElementById(`${role}-code-section`);
const verifyBtn = document.getElementById(`${role}-verify-btn`);

if (!emailInput || !errorElement || !codeSection || !verifyBtn) {
  console.error(`Form elements for ${role} not found. Check HTML IDs: ${role}-email, ${role}-error, ${role}-code-section, ${role}-verify-btn`);
  errorElement.textContent = 'Формд алдаа байна. Админтай холбогдоно уу.';
  return;
}

const email = emailInput.value.trim();
console.log(`Sending verification code to: ${email} for role: ${role}`);

if (!email) {
  errorElement.textContent = 'Мэйл хаягаа оруулна уу.';
  console.error(`Email input is empty for ${role}`);
  return;
}

if (!email.endsWith('@num.edu.mn') && !email.endsWith('@stud.num.edu.mn')) {
  errorElement.textContent = 'Зөвхөн сургуулийн мэйл хаяг (@num.edu.mn эсвэл @stud.num.edu.mn) ашиглана уу.';
  console.error(`Invalid email domain: ${email}`);
  return;
}

const targetUser = role === 'student' ? MOCK_STUDENT : MOCK_STAFF;
if (email !== targetUser.email) {
  errorElement.textContent = 'Мэйл хаяг бүртгэлгүй байна.';
  console.error(`Email ${email} not found in mock data for ${role}`);
  return;
}

const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
localStorage.setItem('verificationCode', verificationCode);
localStorage.setItem('pendingEmail', email);
localStorage.setItem('pendingRole', role);

// 15 минутын хугацаа нэмэх
const expiryDate = new Date(Date.now() + 15 * 60 * 1000);
const expiryTime = expiryDate.toLocaleString('mn-MN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

const templateParams = {
  email: email,
  verification_code: verificationCode,
  to_name: targetUser.firstName,
  expiry_time: expiryTime
};
console.log('Template params:', templateParams);

emailjs.send('NumFormsAuthentication', 'template_yljgqb8', templateParams)
  .then(() => {
    errorElement.textContent = 'Баталгаажуулах код таны мэйл рүү илгээгдлээ.';
    codeSection.classList.remove('hidden');
    verifyBtn.classList.remove('hidden');
    console.log(`Verification code sent successfully to ${email}`);
  }, (error) => {
    errorElement.textContent = 'Код илгээхэд алдаа гарлаа: ' + error.text;
    console.error('EmailJS error:', error);
  });
}

function verifyCode(role) {
const codeInput = document.getElementById(`${role}-code`);
const errorElement = document.getElementById(`${role}-error`);
const storedCode = localStorage.getItem('verificationCode');
const pendingEmail = localStorage.getItem('pendingEmail');
const pendingRole = localStorage.getItem('pendingRole');

if (!codeInput || !errorElement) {
  console.error(`Form elements for ${role} not found. Check HTML IDs: ${role}-code, ${role}-error`);
  errorElement.textContent = 'Формд алдаа байна. Админтай холбогдоно уу.';
  return;
}

const enteredCode = codeInput.value.trim();
console.log(`Verifying code: ${enteredCode} for role: ${role}, pending email: ${pendingEmail}`);

if (!enteredCode) {
  errorElement.textContent = 'Баталгаажуулах кодыг оруулна уу.';
  console.error(`Verification code input is empty for ${role}`);
  return;
}

if (enteredCode === storedCode && pendingRole === role) {
  const targetUser = role === 'student' ? MOCK_STUDENT : MOCK_STAFF;
  if (pendingEmail === targetUser.email) {
    currentUser = JSON.parse(JSON.stringify(targetUser));
    localStorage.setItem('numforms_user', JSON.stringify(currentUser));
    localStorage.removeItem('verificationCode');
    localStorage.removeItem('pendingEmail');
    localStorage.removeItem('pendingRole');

    loadUserData();
    showAuthenticatedUI();
    errorElement.textContent = 'Амжилттай нэвтэрлээ!';
    console.log(`User authenticated: ${targetUser.email}`);
  } else {
    errorElement.textContent = 'Мэйл хаяг таарахгүй байна.';
    console.error(`Pending email ${pendingEmail} does not match target user email ${targetUser.email}`);
  }
} else {
  errorElement.textContent = 'Буруу код. Дахин оролдоно уу.';
  console.error(`Invalid verification code: ${enteredCode}, expected: ${storedCode}, or role mismatch: ${pendingRole} vs ${role}`);
}
}

function handleLogout() {
localStorage.removeItem("numforms_user");
currentUser = null;
userNotifications = [];
userRequests = [];
allRequestsGlobal = [];
showLoginUI();
}

function toggleMobileMenu() {
const navLinks = document.getElementById("navLinks");
if (navLinks) {
  navLinks.classList.toggle("active");
} else {
  console.error("Navigation links element not found.");
}
}

function showLoginUI() {
const loginContainer = document.getElementById("loginContainer");
const homeContainer = document.getElementById("homeContainer");
const navActions = document.querySelector(".nav-actions");

if (loginContainer) loginContainer.classList.remove("hidden");
else console.error("Login container not found.");
if (homeContainer) homeContainer.classList.add("hidden");
else console.error("Home container not found.");

if (navActions) {
  navActions.style.display = "none";
} else {
  console.warn("Navigation actions not found.");
}

const studentEmailInput = document.getElementById("student-email");
const studentCodeInput = document.getElementById("student-code");
const studentCodeSection = document.getElementById("student-code-section");
const studentVerifyBtn = document.getElementById("student-verify-btn");
const staffEmailInput = document.getElementById("staff-email");
const staffCodeInput = document.getElementById("staff-code");
const staffCodeSection = document.getElementById("staff-code-section");
const staffVerifyBtn = document.getElementById("staff-verify-btn");

if (studentEmailInput) studentEmailInput.value = "";
if (studentCodeInput) studentCodeInput.value = "";
if (studentCodeSection) studentCodeSection.classList.add("hidden");
if (studentVerifyBtn) studentVerifyBtn.classList.add("hidden");
if (staffEmailInput) staffEmailInput.value = "";
if (staffCodeInput) staffCodeInput.value = "";
if (staffCodeSection) staffCodeSection.classList.add("hidden");
if (staffVerifyBtn) staffVerifyBtn.classList.add("hidden");

const studentTabBtn = document.querySelector(".login-card .tab-btn[data-tab='student']");
const staffTabBtn = document.querySelector(".login-card .tab-btn[data-tab='staff']");
const studentTabPane = document.getElementById("student-tab");
const staffTabPane = document.getElementById("staff-tab");

if (studentTabBtn && staffTabBtn && studentTabPane && staffTabPane) {
  studentTabBtn.classList.add("active");
  staffTabBtn.classList.remove("active");
  studentTabPane.classList.add("active");
  staffTabPane.classList.remove("active");
} else {
  console.error("Tab elements missing. Check HTML for 'tab-btn' and 'tab-pane' classes/IDs.");
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
  requestServiceDescription.textContent = currentUser.userType === 'student' 
    ? "Өөрийн илгээсэн өргөдлүүдийг хянах, шинээр өргөдөл гаргах боломжтой."
    : "Танд ирсэн оюутнуудын өргөдлүүдийг хянан үзэж, шийдвэрлэх боломжтой.";
}
updateNotificationBadge();
}

function updateNotificationBadge() {
const badge = document.getElementById("notificationBadge");
if (badge && currentUser) {
  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  badge.textContent = unreadCount > 0 ? unreadCount : "";
  badge.style.display = unreadCount > 0 ? "flex" : "none";
} else if (badge) {
  badge.style.display = "none";
}
}

document.addEventListener("DOMContentLoaded", initApp);