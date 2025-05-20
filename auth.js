// auth.js - Staff authentication for QR code access

let currentStaff = null;

function initAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const accessKey = urlParams.get('key');
  
  if (requestId && accessKey) {
    showStaffAuthModal(requestId, accessKey);
  }
}

function showStaffAuthModal(requestId, accessKey) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Нэвтрэх</h3>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Имэйл</label>
          <input type="email" id="staffAuthEmail" class="form-input" placeholder="staff@num.edu.mn">
        </div>
        <div class="form-group">
          <label class="form-label">Нууц үг</label>
          <input type="password" id="staffAuthPassword" class="form-input" placeholder="••••••••">
        </div>
        <p class="error-text hidden" id="staffAuthError"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="staffAuthSubmit">Нэвтрэх</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('staffAuthSubmit').addEventListener('click', () => {
    const email = document.getElementById('staffAuthEmail').value;
    const password = document.getElementById('staffAuthPassword').value;
    
    authenticateStaff(email, password, requestId, accessKey);
  });
}

function authenticateStaff(email, password, requestId, accessKey) {
  // In a real app, this would call your backend
  // For demo, we'll check against hardcoded staff4
  if (email === '22b1NUM7873@stud.num.edu.mn' && password === 'staff4password') {
    currentStaff = { id: 'staff4', email: email };
    checkRequestAccess(requestId, accessKey);
  } else {
    showAuthError('Буруй имэйл эсвэл нууц үг');
  }
}

function checkRequestAccess(requestId, accessKey) {
  const request = allRequests.find(req => 
    req.id === requestId && 
    req.access_key === accessKey &&
    req.assigned_to === currentStaff.id
  );
  
  if (request) {
    // Hide auth modal
    document.querySelector('.modal-overlay').remove();
    // Show the request
    renderRequestDetails(request);
  } else {
    showAuthError('Та уг өргөдөлд хандах эрхгүй байна');
  }
}

function showAuthError(message) {
  const errorEl = document.getElementById('staffAuthError');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAuth);