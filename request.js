// request.js - Өргөдлийн дэлгэрэнгүй хуудасны JavaScript

// State management
let currentUser = null;
let currentRequestId = null;
let allRequests = [];
let userNotifications = [];

// DOM Elements (хуудас ачаалахад бэлэн байгаа гол элементүүд)
const requestDetailEl = document.getElementById("requestDetail");
const requestNotFoundEl = document.getElementById("requestNotFound");

// --- Initialization and User Handling ---
function initRequestPage() {
    const storedUser = localStorage.getItem("numforms_user");
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateNavbarProfile();
            loadUserNotifications();

            const urlParams = new URLSearchParams(window.location.search);
            currentRequestId = urlParams.get('id');

            if (currentRequestId) {
                loadAllRequests();
                const request = findRequestById(currentRequestId);
                if (request) {
                    renderRequestDetails(request);
                    // Event listeners for dynamically added buttons will be set up in renderRequestDetails
                } else {
                    displayRequestNotFound();
                }
            } else {
                displayRequestNotFound();
            }
        } catch (error) {
            console.error("Хуудас ачаалахад алдаа гарлаа:", error);
            localStorage.removeItem("numforms_user");
            displayRequestNotFound();
        }
    } else {
        window.location.href = "index.html";
    }
    setupGeneralEventListeners();
}

function updateNavbarProfile() {
    const profileNameEl = document.getElementById("profileName");
    if (profileNameEl && currentUser) {
        profileNameEl.textContent = currentUser.firstName;
    }
}

function loadUserNotifications() {
    if (!currentUser) return;
    const storedNotifications = localStorage.getItem(`numforms_notifications_${currentUser.id}`);
    userNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badgeEl = document.getElementById("notificationBadge");
    if (badgeEl) {
        const unreadCount = userNotifications.filter(n => !n.isRead).length;
        badgeEl.textContent = unreadCount > 0 ? unreadCount : "";
        badgeEl.style.display = unreadCount > 0 ? "flex" : "none";
    }
}

function loadAllRequests() {
    const storedRequests = localStorage.getItem("numforms_all_requests");
    allRequests = storedRequests ? JSON.parse(storedRequests) : [];
}

function findRequestById(requestId) {
    return allRequests.find(req => req.id === requestId);
}

function findRequestSubmitter(studentId) {
    // Энэ хэсгийг бодит системд хэрэglэгчийн мэдээллийн сангаас татах шаардлагатай
    if (currentUser && currentUser.id === studentId && currentUser.type === 'student') {
        return `${currentUser.lastName.charAt(0)}. ${currentUser.firstName}`;
    }
    // Бусад тохиолдолд (жишээ нь админ өөр оюутны өргөдлийг харж байвал)
    // Users массиваас хайх логик нэмж болно (хэрэв байгаа бол)
    // Түр ийнхүү харуулъя:
    const allUsers = JSON.parse(localStorage.getItem("numforms_users")) || [];
    const submitter = allUsers.find(user => user.id === studentId && user.type === 'student');
    if (submitter) {
        return `${submitter.lastName.charAt(0)}. ${submitter.firstName}`;
    }
    return `Оюутан (ID: ${studentId.slice(-4)})`; // Сүүлийн 4 орон
}

function getRequestTypeDisplay(typeValue) {
    const types = {
        "r_rating_request": "R үнэлгээний хүсэлт", "grade_dispute_complaint": "Дүнгийн маргаан, гомдол",
        "late_registration": "Хожимдсон бүртгэл", "course_cancellation": "Хичээл цуцлуулах",
        "add_elective_course": "Чөлөөт сонголт нэмүүлэх", "transfer_elective_course": "Чөлөөт сонголт шилжүүлэх",
        "minor_program_application": "Хавсрага хөтөлбөр", "leave_of_absence_request": "Чөлөө авах",
        "re_enrollment_request": "Эргэн суралцах", "student_personal_plan": "Хувийн төлөвлөгөө",
        "school_withdrawal_request": "Сургуулиас хасагдах", "dormitory_checkout_request": "Байрнаас гарах",
        "refund_request": "Төлбөрийн буцаалт", "unified_form_report": "Нэгдсэн маягтын тайлан", "other": "Бусад"
    };
    return types[typeValue] || typeValue;
}

function getRequestStatusDisplay(statusValue) {
    const statuses = { "PENDING": "Хүлээгдэж буй", "APPROVED": "Зөвшөөрсөн", "REJECTED": "Татгалзсан", "PROCESSING": "Шийдвэрлэж буй" };
    return statuses[statusValue.toUpperCase()] || statusValue;
}

function displayRequestNotFound() {
    if (requestDetailEl) requestDetailEl.classList.add("hidden");
    if (requestNotFoundEl) requestNotFoundEl.classList.remove("hidden");
    // Хуудасны гарчгийг ч өөрчилж болно
    const pageTitle = document.querySelector('.forms-container h1');
    if (pageTitle) pageTitle.textContent = "Өргөдөл олдсонгүй";
}

// --- Rendering Request Details ---
function renderRequestDetails(request) {
    if (!requestDetailEl || !requestNotFoundEl) return;

    requestDetailEl.classList.remove("hidden");
    requestNotFoundEl.classList.add("hidden");

    const requestTypeDisplay = getRequestTypeDisplay(request.type);
    const submittedDate = new Date(request.submittedAt).toLocaleString('mn-MN', { dateStyle: 'short', timeStyle: 'short' });
    const submitterName = request.studentId ? findRequestSubmitter(request.studentId) : 'Тодорхойгүй';

    let commentsHTML = '<p><em>Шийдвэрлэлтийн явц, комментууд одоогоор алга.</em></p>';
    if (request.comments && request.comments.length > 0) {
        commentsHTML = request.comments.map(comment => {
            const commentDate = new Date(comment.timestamp).toLocaleString('mn-MN', { dateStyle: 'short', timeStyle: 'short' });
            const authorDisplay = comment.authorName || (comment.authorRole === 'admin' || comment.authorRole === 'staff' ? 'Сургуулийн ажилтан' : 'Оюутан');
            return `
                <div class="comment-item-detail">
                    <p><strong>${authorDisplay}:</strong> ${comment.text}</p>
                    <p class="comment-time-detail">${commentDate}</p>
                </div>
            `;
        }).join('');
    }

    let adminActionsHTML = '';
    if (currentUser && (currentUser.type === 'admin' || currentUser.type === 'staff')) {
        const isPending = request.status === 'PENDING';
        adminActionsHTML = `
            <div class="add-comment-form-container" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color-light, #eee);">
                <h4>Шийдвэр гаргах / Коммент нэмэх</h4>
                <div class="form-group">
                    <label for="newCommentTextDynamic" class="form-label">Тайлбар / Шалтгаан:</label>
                    <textarea id="newCommentTextDynamic" class="form-textarea" placeholder="Шийдвэр, комментоо энд бичнэ үү..."></textarea>
                </div>
                <div class="admin-actions" style="margin-top: 10px; display: flex; gap: 10px;">
                    <button id="approveRequestBtnDynamic" class="btn btn-success" ${!isPending ? 'disabled' : ''}>Зөвшөөрөх</button>
                    <button id="rejectRequestBtnDynamic" class="btn btn-danger" ${!isPending ? 'disabled' : ''}>Татгалзах</button>
                    <button id="addCommentBtnDynamic" class="btn btn-primary">Коммент нэмэх</button>
                </div>
            </div>
        `;
    }

    requestDetailEl.innerHTML = `
        <div class="card request-detail-card">
            <h2 id="requestTitle">${request.title}</h2>
            <p id="requestMeta" class="request-meta-detail">
                <span><b>ID:</b> ${request.id.slice(-6)}</span> | 
                <span><b>Төрөл:</b> ${requestTypeDisplay}</span> | 
                <span><b>Статус:</b> <span class="request-status status-${request.status.toLowerCase()}">${getRequestStatusDisplay(request.status)}</span></span> |
                <span><b>Илгээсэн:</b> ${submittedDate}</span> |
                <span><b>Илгээгч:</b> ${submitterName}</span>
            </p>
            <hr style="margin: var(--spacing-md) 0;">
            <div id="requestBody" class="request-body-detail">
                <h4>Өргөдлийн агуулга:</h4>
                <p id="requestDescription">${request.description || "Дэлгэрэнгүй мэдээлэл алга."}</p>
            </div>
            <div id="requestCommentsSection" class="request-comments-section">
                <h4>Шийдвэрлэлтийн явц / Комментууд:</h4>
                <div id="requestCommentsList" class="comment-list-detail">
                    ${commentsHTML}
                </div>
            </div>
            ${adminActionsHTML}
        </div>
    `;

    // Dynamically added buttons need event listeners attached *after* they are in the DOM
    if (currentUser && (currentUser.type === 'admin' || currentUser.type === 'staff')) {
        const approveBtn = document.getElementById("approveRequestBtnDynamic");
        const rejectBtn = document.getElementById("rejectRequestBtnDynamic");
        const addCommentBtn = document.getElementById("addCommentBtnDynamic");
        const newCommentText = document.getElementById("newCommentTextDynamic");

        if (approveBtn) {
            approveBtn.onclick = () => handleRequestAction(request.id, 'APPROVED', newCommentText.value || "Зөвшөөрөв.");
        }
        if (rejectBtn) {
            rejectBtn.onclick = () => {
                const reason = newCommentText.value;
                if (!reason.trim()) {
                    alert("Татгалзах шалтгаанаа бичнэ үү.");
                    newCommentText.focus();
                    return;
                }
                handleRequestAction(request.id, 'REJECTED', reason);
            };
        }
        if (addCommentBtn) {
            addCommentBtn.onclick = () => {
                const commentText = newCommentText.value;
                if (!commentText.trim()) {
                    alert("Коммент бичнэ үү.");
                    newCommentText.focus();
                    return;
                }
                handleRequestAction(request.id, request.status, commentText); // Keep current status, just add comment
            };
        }
    }
}


// --- Action Handling (Admin/Staff) ---
function handleRequestAction(requestId, newStatus, commentText) {
    const requestIndex = allRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
        console.error("Үйлдэл хийх өргөдөл олдсонгүй!");
        return;
    }

    const updatedRequest = { ...allRequests[requestIndex] };
    let statusChanged = false;

    if ((newStatus === 'APPROVED' || newStatus === 'REJECTED') && updatedRequest.status === 'PENDING') {
        updatedRequest.status = newStatus;
        statusChanged = true;
    }

    if (commentText && commentText.trim()) {
        const newComment = {
            text: commentText.trim(),
            authorId: currentUser.id,
            authorName: `${currentUser.lastName.charAt(0)}. ${currentUser.firstName}`,
            authorRole: currentUser.type,
            timestamp: new Date().toISOString()
        };
        updatedRequest.comments = [...(updatedRequest.comments || []), newComment];
    }
    
    allRequests[requestIndex] = updatedRequest;
    localStorage.setItem("numforms_all_requests", JSON.stringify(allRequests));

    // Create notification if status changed or a new comment was added by admin/staff for student's request
    if (updatedRequest.studentId && updatedRequest.studentId !== currentUser.id) {
         if (statusChanged || (commentText && commentText.trim()) ) {
            createNotificationForStudent(updatedRequest, statusChanged, commentText);
        }
    }

    renderRequestDetails(updatedRequest); // Re-render to show updated status and comments

    // Clear comment textarea if it exists (it's dynamically created)
    const newCommentTextElem = document.getElementById("newCommentTextDynamic");
    if (newCommentTextElem) {
        newCommentTextElem.value = "";
    }
    
    showToast(statusChanged ? `Өргөдлийг ${getRequestStatusDisplay(newStatus).toLowerCase()} болголоо.` : "Коммент нэмэгдлээ.");
}

function createNotificationForStudent(request, statusHasChanged, lastCommentText) {
    if (!request.studentId) return;

    let title;
    let message;

    if (statusHasChanged) {
        title = `Таны "${request.title}" гарчигтай өргөдөл`;
        if (request.status === 'APPROVED') {
            title += " зөвшөөрөгдлөө.";
            message = `Баяр хүргэе! Таны өргөдөл амжилттай зөвшөөрөгдлөө. ${lastCommentText ? "Тайлбар: " + lastCommentText : ""}`;
        } else if (request.status === 'REJECTED') {
            title += " татгалзлаа.";
            message = `Харамсалтай байна, таны өргөдөлд татгалзсан хариу ирлээ. ${lastCommentText ? "Шалтгаан: " + lastCommentText : "Нэмэлт тайлбарыг шалгана уу."}`;
        }
    } else if (lastCommentText) { // Only comment added, status didn't change
        title = `Таны "${request.title}" өргөдөлд шинэ коммент`;
        message = `Сургуулийн ажилтан таны өргөдөлд "${lastCommentText}" гэсэн коммент үлдээлээ.`;
    } else {
        return; // No status change and no comment text, so no notification
    }


    const studentNotificationsKey = `numforms_notifications_${request.studentId}`;
    let studentNotifications = JSON.parse(localStorage.getItem(studentNotificationsKey)) || [];
    
    const newNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedTo: { type: "request", id: request.id }
    };
    studentNotifications.unshift(newNotification);
    localStorage.setItem(studentNotificationsKey, JSON.stringify(studentNotifications));
}

// --- General Event Listeners and Utilities ---
function setupGeneralEventListeners() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Таны HTML-д байгаа "Өргөдлүүд рүү буцах" товчнуудад event listener нэмж болно,
    // Гэхдээ энэ нь энгийн 'a' таг тул шууд ажиллах ёстой.
}

function toggleMobileMenu() {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}

function handleLogout() {
    localStorage.removeItem("numforms_user");
    // Optionally clear other related localStorage items
    // localStorage.removeItem("numforms_all_requests"); 
    // localStorage.removeItem("numforms_notifications_..."); // This needs iteration or specific keys
    window.location.href = "index.html";
}

function showToast(message) {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast-notification slide-in"; // "toast" гэсэн нэр CSS-тэй зөрчилдөж магадгүй
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.replace("slide-in", "slide-out");
        setTimeout(() => {
            if (toast.parentNode) {
                 toast.parentNode.removeChild(toast);
            }
        }, 500); // matches slide-out animation
    }, 3000);
}

// Add styles for toast dynamically (if not in main CSS)
(function addToastStyles() {
    if (document.getElementById('toast-styles')) return; // Already added
    const style = document.createElement("style");
    style.id = 'toast-styles';
    style.textContent = `
      .toast-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color, #333);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius-md, 6px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1050;
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .toast-notification.slide-in {
        opacity: 1;
        bottom: 40px; /* Animate upwards */
      }
      .toast-notification.slide-out {
        opacity: 0;
        bottom: 20px; /* Animate downwards */
      }
    `;
    document.head.appendChild(style);
})();

// Initialize page
document.addEventListener("DOMContentLoaded", initRequestPage);