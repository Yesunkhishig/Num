// JotForm URLs and Descriptions
const jotFormUrls = {
  'r_rating_request': 'https://form.jotform.com/251119434684459',
  'grade_dispute_complaint': 'https://form.jotform.com/251331602827451',
  'late_registration': 'https://form.jotform.com/251119434684459',
  'course_cancellation': 'https://form.jotform.com/251119434684459',
  'add_elective_course': 'https://form.jotform.com/251119434684459',
  'transfer_elective_course': 'https://form.jotform.com/251119434684459',
  'minor_program_application': 'https://form.jotform.com/251119434684459',
  'leave_of_absence_request': 'https://form.jotform.com/251119434684459',
  're_enrollment_request': 'https://form.jotform.com/251119434684459',
  'student_personal_plan': 'https://form.jotform.com/251119434684459',
  'school_withdrawal_request': 'https://form.jotform.com/251119434684459',
  'dormitory_checkout_request': 'https://form.jotform.com/251119434684459',
  'refund_request': 'https://form.jotform.com/251119434684459',
  'unified_form_report': 'https://form.jotform.com/251119434684459'
};

const requestTypeDescriptions = {
  'r_rating_request': 'R үнэлгээний хүсэлт нь таны сургалтын үнэлгээтэй холбоотой асуудлыг шийдвэрлэхэд чиглэнэ.',
  'grade_dispute_complaint': 'Дүнгийн маргаан, гомдолтой холбоотой асуудлыг шийдвэрлэх хүсэлт.',
  'late_registration': 'Хугацаа хожимдсон тохиолдолд бүртгэл хийлгэх хүсэлт.',
  'course_cancellation': 'Сонгосон хичээлийг цуцлах хүсэлт.',
  'add_elective_course': 'Чөлөөт сонголтын хичэел нэмэх хүсэлт.',
  'transfer_elective_course': 'Чөлөөт сонголтын хичээлийг өөр хичээлээр солих хүсэлт.',
  'minor_program_application': 'Хавсрага хөтөлбөрт хамрагдах хүсэлт.',
  'leave_of_absence_request': 'Суралцагчид түр хугацаагаар чөлөө авах хүсэлт.',
  're_enrollment_request': 'Сургуульдаа эргэн суралцах хүсэлт.',
  'student_personal_plan': 'Суралцагчийн хувийн сургалтын төлөвлөгөөний хүсэлт.',
  'school_withdrawal_request': 'Сургуулиас гарах хүсэлт.',
  'dormitory_checkout_request': 'Оюутны байрнаас гарах хүсэлт.',
  'refund_request': 'Төлбөрийн буцаалт хүсэх.',
  'unified_form_report': 'Нэгдсэн маягтын тайлангийн хүсэлт.',
  'custom_request': 'Өөрөө бичиж оруулах өргөдлийн хүсэлт.'
};

// Form handling
const typeSelect = document.getElementById('type');
const jotFormIFrame = document.getElementById('jotFormIFrame');
const descriptionTextarea = document.getElementById('description');
const requestTypeDescription = document.getElementById('requestTypeDescription');

function updateForm() {
  const selectedType = typeSelect.value;
  if (selectedType === 'custom_request') {
    jotFormIFrame.classList.add('hidden');
    descriptionTextarea.classList.remove('hidden');
  } else if (selectedType) {
    jotFormIFrame.classList.remove('hidden');
    descriptionTextarea.classList.add('hidden');
    jotFormIFrame.src = jotFormUrls[selectedType] || 'https://form.jotform.com/251119434684459';
  } else {
    jotFormIFrame.classList.add('hidden');
    descriptionTextarea.classList.add('hidden');
  }
  requestTypeDescription.textContent = selectedType && requestTypeDescriptions[selectedType]
    ? requestTypeDescriptions[selectedType]
    : 'Өргөдлийн төрлийг сонгоно уу.';
}

if (typeSelect) {
  typeSelect.addEventListener('change', updateForm);
  updateForm();
}

// State management
let currentUser = null;
let userRequests = [];
let allRequests = [];
let userNotifications = [];
let currentRequestId = null;
let currentAction = null;

const REQUEST_TYPES = {
  'r_rating_request': 'R үнэлгээний хүсэлт гаргах',
  'grade_dispute_complaint': 'Дүнгийн маргаан, гомдол барагдуулах',
  'late_registration': 'Хожимдсон бүртгэл хийлгэх',
  'course_cancellation': 'Хичээл цуцлуулах',
  'add_elective_course': 'Чөлөөт сонголтын хичэел нэмүүлэх',
  'transfer_elective_course': 'Чөлөөт сонголтын хичэел шилжүүлэх маягт',
  'minor_program_application': 'Хавсрага хөтөлбөрийн маягт',
  'leave_of_absence_request': 'Суралцагчид чөлөө олгох хуудас',
  're_enrollment_request': 'Эргэн суралцах хүсэлтийн маягт',
  'student_personal_plan': 'Суралцагчдын хувийн төлөвлөгөөний маягт',
  'school_withdrawal_request': 'Суралцагч сургуулиас хасагдах хүсэлтийн маягт',
  'dormitory_checkout_request': 'Байрнаас гарах хүсэлт',
  'refund_request': 'Төлбөрийн буцаалт',
  'unified_form_report': 'Нэгдсэн маягтын тайлан',
  'custom_request': 'Өргөдөл'
};

function initFormsPage() {
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
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
}

function loadData() {
  const storedRequests = localStorage.getItem("numforms_requests");
  if (storedRequests) {
    try {
      allRequests = JSON.parse(storedRequests);
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
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = currentUser.firstName;
  }

  updateNotificationBadge();

  const isStudent = currentUser.userType === "student";
  document.getElementById("formsTitle").textContent = isStudent 
    ? "Өргөдөл, маягт илгээх" 
    : "Өргөдөл, хүсэлт хянах";
  document.getElementById("requestForm").style.display = isStudent ? "block" : "none";

  // Тайлан татах хэсгийг зөвхөн ажилтанд харуулах
  const reportSection = document.getElementById("reportSection");
  if (reportSection) {
    reportSection.style.display = isStudent ? "none" : "block";
    console.log("Report section display set to:", reportSection.style.display);
  } else {
    console.error("reportSection element not found");
  }

  const pendingRequests = userRequests.filter(req => req.status === "pending");
  const approvedRequests = userRequests.filter(req => req.status === "approved");
  const rejectedRequests = userRequests.filter(req => req.status === "rejected");

  document.getElementById("pendingCount").textContent = pendingRequests.length > 0 ? `(${pendingRequests.length})` : "";
  document.getElementById("approvedCount").textContent = approvedRequests.length > 0 ? `(${approvedRequests.length})` : "";
  document.getElementById("rejectedCount").textContent = rejectedRequests.length > 0 ? `(${rejectedRequests.length})` : "";

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

  const sortedRequests = [...requests].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  listElement.innerHTML = "";

  sortedRequests.forEach(request => {
    const requestElement = document.createElement("div");
    requestElement.className = "request-item";
    requestElement.setAttribute("data-id", request.id);

    const date = new Date(request.createdAt);
    const formattedDate = date.toLocaleDateString("mn-MN");
    const requestTypeLabel = REQUEST_TYPES[request.type] || request.type;

    requestElement.innerHTML = `
      <div class="request-header">
        <div>
          <h3 class="request-title">${request.title}</h3>
          <p class="request-meta">
            ${currentUser.userType === "staff" ? `Оюутны дугаар: ${request.userId} •` : `Төрөл: ${requestTypeLabel} •`} 
            ${request.formUrl ? `<a href="${request.formUrl}" target="_blank" class="form-link">Форм харах</a> • ` : ''} 
            Огноо: ${formattedDate}
          </p>
        </div>
        <span class="request-status status-${request.status}">
          ${getStatusLabel(request.status)}
        </span>
      </div>
      <div class="request-body">
        ${request.description ? `<p class="request-description">${request.description}</p>` : ''}
        ${request.formUrl ? `<p class="request-form-link">Форм: <a href="${request.formUrl}" target="_blank" class="form-link">Харах</a></p>` : ''}
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

    if (currentUser.userType === "staff") {
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
    }

    const formLinks = requestElement.querySelectorAll(".form-link");
    formLinks.forEach(link => {
      link.addEventListener("click", async (e) => {
        try {
          const response = await fetch(link.href, { method: 'HEAD', mode: 'no-cors' });
          if (!response.ok) {
            e.preventDefault();
            showToast("Алдаа", "Форм хандах боломжгүй байна. Админтай холбогдоно уу.", "error");
          }
        } catch (error) {
          e.preventDefault();
          showToast("Алдаа", "Форм хандах боломжгүй байна: Сервертэй холбогдох боломжгүй.", "error");
          console.error("Form link check failed:", error);
        }
      });
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
  const requestForm = document.getElementById("newRequestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", handleRequestSubmit);
  }

  const tabButtons = document.querySelectorAll(".request-tab");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const tabId = this.getAttribute("data-tab");
      document.querySelectorAll(".request-tab").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".request-panel").forEach(p => p.classList.remove("active"));
      this.classList.add("active");
      const panel = document.getElementById(`${tabId}Panel`);
      if (panel) {
        panel.classList.add("active");
      } else {
        console.error("Panel not found:", `${tabId}Panel`);
      }
    });
  });

  document.getElementById("closeRequestModal").addEventListener("click", closeModal);
  document.getElementById("cancelModal").addEventListener("click", closeModal);
  document.getElementById("saveComment").addEventListener("click", handleSaveComment);

  const downloadReportBtn = document.getElementById("downloadReportBtn");
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", downloadMonthlyReport);
    console.log("Download report button listener added");
  } else {
    console.error("downloadReportBtn not found");
  }

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

function handleRequestSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;

  if (!title || !type) {
    showToast("Алдаа", "Гарчиг болон төрлийг бөглөнө үү", "error");
    return;
  }

  let description = "";
  let formUrl = "";

  if (type === "custom_request") {
    description = document.getElementById("description").value.trim();
    if (!description) {
      showToast("Алдаа", "Өргөдлийн агуулгыг бөглөнө үү", "error");
      return;
    }
  } else {
    formUrl = jotFormUrls[type] || `https://form.jotform.com/251119434684459`;
  }

  const now = new Date().toISOString();
  const newRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: currentUser.id,
    title,
    description: description || null,
    formUrl: formUrl || null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    comments: [],
    type
  };

  allRequests.push(newRequest);
  localStorage.setItem("numforms_requests", JSON.stringify(allRequests));

  generateQRCode(newRequest);

  addNotification({
    userId: "STAFF001",
    title: "Шинэ өргөдөл",
    message: `${currentUser.firstName} оюутан шинээр өргөдөл илгээлээ`,
    isRead: false,
    relatedTo: {
      type: "request",
      id: newRequest.id
    }
  });

  document.getElementById("newRequestForm").reset();

  loadData();
  updateUI();

  showToast("Амжилттай", "Таны өргөдөл амжилттай илгээгдлээ");
  document.getElementById('qrCodeSection').scrollIntoView({ behavior: 'smooth' });
}

function openCommentModal(requestId) {
  currentRequestId = requestId;
  currentAction = "comment";
  document.getElementById("requestModalTitle").textContent = "Тайлбар нэмэх";
  document.getElementById("commentText").value = "";
  document.getElementById("requestModal").classList.remove("hidden");
}

function openActionModal(requestId, action) {
  currentRequestId = requestId;
  currentAction = action;
  document.getElementById("requestModalTitle").textContent = action === "approve" ? "Өргөдөл батлах" : "Өргөдөл татгалзах";
  document.getElementById("commentText").value = "";
  document.getElementById("requestModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("requestModal").classList.add("hidden");
  currentRequestId = null;
  currentAction = null;
}

function handleSaveComment() {
  const commentText = document.getElementById("commentText").value.trim();

  if (!commentText) {
    showToast("Алдаа", "Тайлбар хоосон байж болохгүй", "error");
    return;
  }

  const requestIndex = allRequests.findIndex(req => req.id === currentRequestId);
  if (requestIndex === -1) {
    showToast("Алдаа", "Өргөдөл олдсонгүй", "error");
    closeModal();
    return;
  }

  const comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestId: currentRequestId,
    userId: currentUser.id,
    userFullName: `${currentUser.firstName} ${currentUser.lastName || ''}`,
    userType: currentUser.userType,
    content: commentText,
    createdAt: new Date().toISOString()
  };

  if (!allRequests[requestIndex].comments) {
    allRequests[requestIndex].comments = [];
  }

  allRequests[requestIndex].comments.push(comment);

  if (currentAction === "approve") {
    allRequests[requestIndex].status = "approved";
    allRequests[requestIndex].updatedAt = new Date().toISOString();
  } else if (currentAction === "reject") {
    allRequests[requestIndex].status = "rejected";
    allRequests[requestIndex].updatedAt = new Date().toISOString();
  }

  localStorage.setItem("numforms_requests", JSON.stringify(allRequests));

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

  closeModal();
  loadData();
  updateUI();

  showToast("Амжилттай", currentAction === "comment" ? "Тайлбар нэмэгдлээ" : 
            currentAction === "approve" ? "Өргөдөл батлагдлаа" : "Өргөдөл татгалзлаа");
}

function addNotification(notification) {
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

  const newNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  userNotifs.unshift(newNotification);
  localStorage.setItem(`numforms_notifications_${notification.userId}`, JSON.stringify(userNotifs));

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
  localStorage.removeItem("numforms_user");
  window.location.href = "index.html";
}

function showToast(title, message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type} fade-in`;

  toast.innerHTML = `
    <div class="toast-header">${title}</div>
    <div class="toast-body">${message}</div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("fade-in");
    toast.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

function generateQRCode(formData) {
  try {
    const qrCodeSection = document.getElementById('qrCodeSection');
    qrCodeSection.classList.remove('hidden');
    qrCodeSection.innerHTML = '<p class="loading">QR код үүсгэж байна...</p>';

    const baseUrl = window.location.origin;
    const viewUrl = `${baseUrl}/view-submission.html?id=${encodeURIComponent(formData.id)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(viewUrl)}&size=200x200&format=png&margin=10`;

    qrCodeSection.innerHTML = `
      <h3>Таны өргөдлийн QR код</h3>
      <div class="qr-code-wrapper">
        <img id="qrCodeImage" src="${qrApiUrl}" alt="QR Code" />
      </div>
      <p class="qr-instructions">Энэ QR кодыг хадгалаарай. Өргөдлийн төлөвийг хянах боломжтой.</p>
      <button id="downloadQrBtn" class="btn btn-secondary">QR кодыг татах</button>
    `;

    const newQrCodeImage = document.getElementById('qrCodeImage');
    const newDownloadBtn = document.getElementById('downloadQrBtn');

    newQrCodeImage.onload = () => {
      newDownloadBtn.disabled = false;
    };

    newQrCodeImage.onerror = () => {
      qrCodeSection.innerHTML = '<p class="error">QR код үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.</p>';
      console.error("Failed to load QR code image");
    };

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

async function downloadQRCode(src, filename) {
  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error('Failed to fetch QR code image');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download QR code:", error);
    showToast("Алдаа", "QR кодыг татахад алдаа гарлаа", "error");
  }
}

function downloadMonthlyReport() {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const resolvedRequests = allRequests.filter(req => {
      const updatedDate = new Date(req.updatedAt);
      return (
        (req.status === "approved" || req.status === "rejected") &&
        updatedDate.getFullYear() === currentYear &&
        updatedDate.getMonth() === currentMonth
      );
    });

    if (resolvedRequests.length === 0) {
      showToast("Анхаар", `Энэ сард (${currentYear}/${currentMonth + 1}) шийдвэрлэгдсэн өргөдөл байхгүй байна.`, "error");
      return;
    }

    const reportData = resolvedRequests.map(req => ({
      "Өргөдлийн ID": req.id,
      "Гарчиг": req.title,
      "Төрөл": REQUEST_TYPES[req.type] || req.type,
      "Оюутны ID": req.userId,
      "Статус": getStatusLabel(req.status),
      "Үүссэн огноо": new Date(req.createdAt).toLocaleString("mn-MN"),
      "Шинэчлэгдсэн огноо": new Date(req.updatedAt).toLocaleString("mn-MN"),
      "Тайлбар": req.comments ? req.comments.map(c => `${c.userFullName} (${new Date(c.createdAt).toLocaleString("mn-MN")}): ${c.content}`).join("; ") : "",
      "Форм URL": req.formUrl || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Тайлан");

    const monthName = `${currentYear}-${currentMonth + 1}`;
    const filename = `numforms_report_${monthName}.xlsx`;

    XLSX.writeFile(workbook, filename);

    showToast("Амжилттай", `Тайлан (${monthName}) амжилттай татагдлаа.`, "success");
  } catch (error) {
    console.error("Failed to generate report:", error);
    showToast("Алдаа", "Тайлан татахад алдаа гарлаа.", "error");
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", initFormsPage);