// JotForm URLs and Descriptions
const jotFormUrls = {
  'r_rating_request': 'https://form.jotform.com/251119434684459',
  'grade_dispute_complaint': 'https://form.jotform.com/251397054789471',
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
import LocalStorageDB from './localStorage.js';
const db = new LocalStorageDB();


function updateForm() {
  const selectedType = typeSelect.value;
  if (selectedType === 'custom_request') {
    jotFormIFrame.classList.add('hidden');
    descriptionTextarea.classList.remove('hidden');
  } else if (selectedType) {
    jotFormIFrame.classList.remove('hidden');
    descriptionTextarea.classList.add('hidden');
    jotFormIFrame.src = jotFormUrls[selectedType] || 'https://form.jotform.com/251397054789471';
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
/*
async function initFormsPage() {
  // Initialize Supabase client
  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
  const storedUser = localStorage.getItem("numforms_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      await loadData();
      updateUI();
      setupEventListeners();
      
      // Subscribe to real-time updates for notifications
      subscribeToNotifications();
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("numforms_user");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
}*/

async function loadData() {
  try {
    const storedRequests = localStorage.getItem("numforms_submissions");
    const allSubmissions = storedRequests ? JSON.parse(storedRequests) : [];

    if (currentUser.userType === "student") {
      userRequests = allSubmissions.filter(req => req.user_id === currentUser.id);
    } else {
      userRequests = allSubmissions.filter(req => req.assigned_to === currentUser.id);
    }

    allRequests = allSubmissions;

    const storedNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
    userNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];

  } catch (err) {
    console.error("Failed to load data from localStorage:", err);
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
  document.getElementById("seeReportBtn").addEventListener("click", () => {
    window.open("https://www.jotform.com/table/251397324877065", "_blank");
  });
  
  document.getElementById("downloadReportBtn").addEventListener("click", downloadMonthlyReport);


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
    return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
  });

  listElement.innerHTML = "";

  sortedRequests.forEach(request => {
    const requestElement = document.createElement("div");
    requestElement.className = "request-item";
    requestElement.setAttribute("data-id", request.id);

    const date = new Date(request.created_at || request.createdAt);
    const formattedDate = date.toLocaleDateString("mn-MN");
    const requestTypeLabel = REQUEST_TYPES[request.type] || request.type;

    requestElement.innerHTML = `
      <div class="request-header">
        <div>
          <h3 class="request-title">${request.title}</h3>
          <p class="request-meta">
            ${currentUser.userType === "staff" ? `Оюутны дугаар: ${request.user_id || request.userId} •` : `Төрөл: ${requestTypeLabel} •`} 
            ${request.form_url || request.formUrl ? `<a href="${request.form_url || request.formUrl}" target="_blank" class="form-link">Форм харах</a> • ` : ''} 
            Огноо: ${formattedDate}
          </p>
        </div>
        <span class="request-status status-${request.status}">
          ${getStatusLabel(request.status)}
        </span>
      </div>
      <div class="request-body">
        ${request.description ? `<p class="request-description">${request.description}</p>` : ''}
        ${request.form_url || request.formUrl ? `<p class="request-form-link">Форм: <a href="${request.form_url || request.formUrl}" target="_blank" class="form-link">Харах</a></p>` : ''}
        ${request.comments && request.comments.length > 0 ? `
          <div class="request-comments">
            <h4 class="comment-title">Тайлбар:</h4>
            <div class="comment-list">
              ${request.comments.map(comment => `
                <div class="comment-item">
                  <div class="comment-header">
                    <span class="comment-author">
                      ${comment.userFullName || comment.user?.first_name + ' ' + comment.user?.last_name} (${comment.userType || comment.user?.user_type === "student" ? "Оюутан" : "Ажилтан"})
                    </span>
                    <span class="comment-date">
                      ${new Date(comment.created_at || comment.createdAt).toLocaleString("mn-MN")}
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

async function handleRequestSubmit(e) {
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
    formUrl = jotFormUrls[type] || `https://form.jotform.com/251331602827451`;
  }

  const now = new Date().toISOString();
  
  // Generate a unique access key for QR code
  const accessKey = generateAccessKey();
  
  // Create submission object for Supabase
  const newSubmission = {
    user_id: currentUser.id,
    title: title,
    type: type,
    description: description || null,
    form_url: formUrl || null,
    status: "pending",
    access_key: accessKey,
    created_at: now,
    updated_at: now
  };

  try {
    // Save to Supabase
    const { data: submission, error } = await supabaseClient
      .from('form_submissions')
      .insert([newSubmission])
      .select();
    
    if (error) throw error;
    
    const newRequest = submission[0];
    
    // Generate QR code for the submission
    generateQRCode(newRequest);
    
    document.getElementById("newRequestForm").reset();
    
    await loadData();
    updateUI();
    
    showToast("Амжилттай", "Таны өргөдөл амжилттай илгээгдлээ");
    document.getElementById('qrCodeSection').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error("Failed to save submission to Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    const localNewRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      title,
      description: description || null,
      formUrl: formUrl || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      comments: [],
      type,
      access_key: accessKey
    };

    allRequests.push(localNewRequest);
    localStorage.setItem("numforms_requests", JSON.stringify(allRequests));
    
    generateQRCode(localNewRequest);
    
    // Create notification for staff (localStorage fallback)
    addNotification({
      userId: "STAFF001",
      title: "Шинэ өргөдөл",
      message: `${currentUser.firstName} оюутан шинээр өргөдөл илгээлээ`,
      isRead: false,
      relatedTo: {
        type: "request",
        id: localNewRequest.id
      }
    });

    document.getElementById("newRequestForm").reset();

    loadData();
    updateUI();

    showToast("Амжилттай", "Таны өргөдөл амжилттай илгээгдлээ");
    document.getElementById('qrCodeSection').scrollIntoView({ behavior: 'smooth' });
  }
}

function generateAccessKey() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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
  document.getElementById("requestModalTitle").textContent = action === "approve" ? "Зөвшөөрөх" : "Татгалзах";
  document.getElementById("commentText").value = "";
  document.getElementById("requestModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("requestModal").classList.add("hidden");
  currentRequestId = null;
  currentAction = null;
}

async function handleSaveComment() {
  const commentText = document.getElementById("commentText").value.trim();
  
  if (!commentText) {
    showToast("Алдаа", "Тайлбар бичнэ үү", "error");
    return;
  }
  
  if (!currentRequestId) {
    showToast("Алдаа", "Өргөдөл олдсонгүй", "error");
    closeModal();
    return;
  }
  
  try {
    // Find the request in Supabase
    const { data: request, error: requestError } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .eq('id', currentRequestId)
      .single();
    
    if (requestError) throw requestError;
    
    // Create comment in Supabase
    const newComment = {
      submission_id: currentRequestId,
      user_id: currentUser.id,
      content: commentText,
      created_at: new Date().toISOString()
    };
    
    const { error: commentError } = await supabaseClient
      .from('submission_comments')
      .insert([newComment]);
    
    if (commentError) throw commentError;
    
    // If this is an action (approve/reject), update the submission status
    if (currentAction === "approve" || currentAction === "reject") {
      const { error: updateError } = await supabaseClient
        .from('form_submissions')
        .update({ 
          status: currentAction === "approve" ? "approved" : "rejected",
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRequestId);
      
      if (updateError) throw updateError;
      
      // Create notification for the student
      const notificationTitle = currentAction === "approve" ? "Өргөдөл зөвшөөрөгдлөө" : "Өргөдөл татгалзагдлаа";
      const notificationMessage = `Таны "${request.title}" өргөдөл ${currentAction === "approve" ? "зөвшөөрөгдлөө" : "татгалзагдлаа"}. Тайлбар: ${commentText}`;
      
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert([{
          user_id: request.user_id,
          title: notificationTitle,
          message: notificationMessage,
          is_read: false,
          related_type: "submission",
          related_id: currentRequestId,
          created_at: new Date().toISOString()
        }]);
      
      if (notifError) throw notifError;
    }
    
    closeModal();
    await loadData();
    updateUI();
    
    showToast("Амжилттай", currentAction === "comment" ? 
      "Тайлбар амжилттай нэмэгдлээ" : 
      currentAction === "approve" ? 
        "Өргөдөл амжилттай зөвшөөрөгдлөө" : 
        "Өргөдөл амжилттай татгалзагдлаа");
    
  } catch (error) {
    console.error("Failed to save comment or update status:", error);
    
    // Fallback to localStorage if Supabase fails
    const requestIndex = allRequests.findIndex(req => req.id === currentRequestId);
    if (requestIndex === -1) {
      showToast("Алдаа", "Өргөдөл олдсонгүй", "error");
      closeModal();
      return;
    }
    
    const now = new Date().toISOString();
    const newComment = {
      id: `comment_${Date.now()}`,
      userFullName: `${currentUser.lastName.charAt(0)}. ${currentUser.firstName}`,
      userType: currentUser.userType,
      content: commentText,
      createdAt: now
    };
    
    if (!allRequests[requestIndex].comments) {
      allRequests[requestIndex].comments = [];
    }
    
    allRequests[requestIndex].comments.push(newComment);
    
    if (currentAction === "approve" || currentAction === "reject") {
      allRequests[requestIndex].status = currentAction === "approve" ? "approved" : "rejected";
      allRequests[requestIndex].updatedAt = now;
      
      // Create notification for the student
      const studentId = allRequests[requestIndex].userId || allRequests[requestIndex].studentId;
      addNotification({
        userId: studentId,
        title: currentAction === "approve" ? "Өргөдөл зөвшөөрөгдлөө" : "Өргөдөл татгалзагдлаа",
        message: `Таны "${allRequests[requestIndex].title}" өргөдөл ${currentAction === "approve" ? "зөвшөөрөгдлөө" : "татгалзагдлаа"}. Тайлбар: ${commentText}`,
        isRead: false,
        createdAt: now,
        relatedTo: {
          type: "request",
          id: currentRequestId
        }
      });
    }
    
    localStorage.setItem("numforms_requests", JSON.stringify(allRequests));
    
    closeModal();
    loadData();
    updateUI();
    
    showToast("Амжилттай", currentAction === "comment" ? 
      "Тайлбар амжилттай нэмэгдлээ" : 
      currentAction === "approve" ? 
        "Өргөдөл амжилттай зөвшөөрөгдлөө" : 
        "Өргөдөл амжилттай татгалзагдлаа");
  }
}

function addNotification(notification) {
  // This is a fallback function for localStorage notifications
  if (!notification.id) {
    notification.id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  if (!notification.createdAt) {
    notification.createdAt = new Date().toISOString();
  }
  
  const storedNotifications = localStorage.getItem(`numforms_notifications_${notification.userId}`);
  let userNotifs = [];
  
  if (storedNotifications) {
    try {
      userNotifs = JSON.parse(storedNotifications);
    } catch (error) {
      console.error("Failed to parse stored notifications:", error);
    }
  }
  
  userNotifs.push(notification);
  localStorage.setItem(`numforms_notifications_${notification.userId}`, JSON.stringify(userNotifs));
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    const unreadCount = userNotifications.filter(n => !n.is_read && !n.isRead).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function subscribeToNotifications() {
  // Subscribe to real-time notifications from Supabase
  const channel = supabaseClient
    .channel(`notifications-${currentUser.id}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${currentUser.id}`
    }, payload => {
      console.log('New notification received:', payload);
      userNotifications.unshift(payload.new);
      updateNotificationBadge();
      showToast("Шинэ мэдэгдэл", payload.new.title);
    })
    .subscribe();
}

function generateQRCode(submission) {
  // Get the QR code section
  const qrCodeSection = document.getElementById('qrCodeSection');
  const qrCodeImage = document.getElementById('qrCodeImage');
  
  // Create the URL for viewing the submission
  const submissionViewUrl = `${window.location.origin}/view-submission.html?id=${submission.id || submission.jotform_submission_id}&key=${submission.access_key}`;
  
  // Generate QR code using Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(submissionViewUrl)}&chs=250x250&choe=UTF-8`;
  
  // Set the QR code image source
  qrCodeImage.src = qrCodeUrl;
  
  // Show the QR code section
  qrCodeSection.classList.remove('hidden');
  
  // Set up download button
  const downloadQrBtn = document.getElementById('downloadQrBtn');
  if (downloadQrBtn) {
    downloadQrBtn.onclick = function() {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${submission.id || submission.jotform_submission_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }
}

function downloadMonthlyReport() {
  console.log("Downloading monthly report...");
  
  // Get current month and year
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = new Intl.DateTimeFormat('mn-MN', { month: 'long' }).format(now);
  
  // Filter requests for current month
  const monthlyRequests = allRequests.filter(req => {
    const reqDate = new Date(req.created_at || req.createdAt);
    return reqDate.getMonth() + 1 === month && reqDate.getFullYear() === year;
  });
  
  if (monthlyRequests.length === 0) {
    showToast("Мэдээлэл", "Энэ сард өргөдөл бүртгэгдээгүй байна", "info");
    return;
  }
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Format data for Excel
  const data = monthlyRequests.map(req => {
    return {
      'ID': req.id,
      'Оюутны ID': req.user_id || req.userId || req.studentId,
      'Гарчиг': req.title,
      'Төрөл': REQUEST_TYPES[req.type] || req.type,
      'Төлөв': getStatusLabel(req.status),
      'Огноо': new Date(req.created_at || req.createdAt).toLocaleDateString('mn-MN'),
      'Шийдвэрлэсэн огноо': req.updated_at || req.updatedAt ? new Date(req.updated_at || req.updatedAt).toLocaleDateString('mn-MN') : '-'
    };
  });
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, `Өргөдөл - ${monthName}`);
  
  // Generate Excel file
  const filename = `NumForms-Тайлан-${year}-${month.toString().padStart(2, '0')}.xlsx`;
  XLSX.writeFile(wb, filename);
  
  showToast("Амжилттай", `${monthName} сарын тайлан татагдлаа`, "success");
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
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  // Create toast content
  toast.innerHTML = `
    <div class="toast-header">
      <strong>${title}</strong>
      <button type="button" class="toast-close">&times;</button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Add event listener to close button
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      toast.classList.add("toast-hiding");
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", initFormsPage);
