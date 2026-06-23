/* ============================================
   AUTHENTICATION MODULE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Signup Page Logic ---
  const signupForm = document.getElementById('signup-form');
  const passwordInput = document.getElementById('signup-password');

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      checkPasswordStrength(passwordInput.value);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('signup-fullname').value.trim();
      const username = document.getElementById('signup-username').value.trim().toLowerCase();
      const email = document.getElementById('signup-email').value.trim().toLowerCase();
      const mobile = document.getElementById('signup-mobile').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      // Basic Validations
      if (password !== confirmPassword) {
        Toast.show('Mismatch Error', 'Passwords do not match.', 'error');
        return;
      }

      if (password.length < 6) {
        Toast.show('Weak Password', 'Password must be at least 6 characters long.', 'warning');
        return;
      }

      // Check user duplication
      const users = AppState.getUsers();
      if (users.find(u => u.email === email)) {
        Toast.show('Account Exists', 'This email is already registered.', 'error');
        return;
      }
      if (users.find(u => u.username === username)) {
        Toast.show('Username Taken', 'Username already taken. Choose another.', 'error');
        return;
      }

      // Directly finalize user registration
      const newUser = {
        fullName,
        username,
        email,
        mobile,
        password,
        joinedDate: new Date().toISOString().split('T')[0],
        role: 'user',
        analysesCount: 0,
        accuracy: 100.0
      };

      users.push(newUser);
      AppState.setUsers(users);
      AppState.setCurrentUser(newUser);

      Toast.show('Account Activated', 'Your registration was successful!', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    });
  }

  // --- Login Page Logic ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      const users = AppState.getUsers();
      const matchedUser = users.find(u => u.email === email && u.password === password);

      if (matchedUser) {
        // Success
        AppState.setCurrentUser(matchedUser);
        Toast.show('Access Granted', `Welcome back, ${matchedUser.fullName}!`, 'success');
        
        // Notification
        const notifications = AppState.getNotifications();
        notifications.push({
          id: Date.now().toString(),
          message: 'Successful login detected from a new session.',
          time: 'Just now',
          read: false
        });
        AppState.setNotifications(notifications);

        setTimeout(() => {
          window.location.href = matchedUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
        }, 1200);
      } else {
        Toast.show('Authentication Failed', 'Invalid email credentials or password.', 'error');
      }
    });
  }
});

// Password Strength Evaluator Logic
function checkPasswordStrength(password) {
  const bars = document.querySelectorAll('.strength-bar');
  const label = document.getElementById('strength-text');
  
  if (!label) return;

  // Clear all bars
  bars.forEach(b => b.className = 'strength-bar');

  if (password.length === 0) {
    label.innerText = 'Enter password';
    return;
  }

  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength === 1) {
    bars[0].classList.add('active', 'weak');
    label.innerText = 'Weak Password';
  } else if (strength === 2) {
    bars[0].classList.add('active', 'fair');
    bars[1].classList.add('active', 'fair');
    label.innerText = 'Fair Strength';
  } else if (strength === 3) {
    bars[0].classList.add('active', 'good');
    bars[1].classList.add('active', 'good');
    bars[2].classList.add('active', 'good');
    label.innerText = 'Good Password';
  } else if (strength === 4) {
    bars[0].classList.add('active', 'strong');
    bars[1].classList.add('active', 'strong');
    bars[2].classList.add('active', 'strong');
    bars[3].classList.add('active', 'strong');
    label.innerText = 'Extremely Strong Password!';
  }
}

// Simulated OTP Modal Controller
let pendingUserPayload = null;
let currentOtpCode = null;

function openOtpModal(userPayload) {
  pendingUserPayload = userPayload;
  
  // Create static OTP code
  currentOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Inject overlay container in body
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay active';
  modalOverlay.id = 'otp-modal';
  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">OTP Security Verification</h2>
        <button class="toast-close" onclick="closeOtpModal()">&times;</button>
      </div>
      <p class="text-secondary text-sm">We have sent a verification code to your email <strong>${userPayload.email}</strong>.</p>
      <div class="otp-inputs">
        <input type="text" maxlength="1" class="otp-input" onkeyup="focusNextOtp(this, 1)">
        <input type="text" maxlength="1" class="otp-input" onkeyup="focusNextOtp(this, 2)">
        <input type="text" maxlength="1" class="otp-input" onkeyup="focusNextOtp(this, 3)">
        <input type="text" maxlength="1" class="otp-input" onkeyup="focusNextOtp(this, 4)">
      </div>
      <div class="text-center mb-6">
        <p class="text-xs text-tertiary">Simulated OTP Delivery Code: <strong style="color: var(--primary-400);">${currentOtpCode}</strong></p>
      </div>
      <button class="btn btn-primary w-full" onclick="verifyOtpCode()">Verify & Create Account</button>
    </div>
  `;
  document.body.appendChild(modalOverlay);
}

window.closeOtpModal = function() {
  const modal = document.getElementById('otp-modal');
  if (modal) modal.remove();
  pendingUserPayload = null;
  currentOtpCode = null;
};

window.focusNextOtp = function(elem, index) {
  if (elem.value.length === 1 && index < 4) {
    document.querySelectorAll('.otp-input')[index].focus();
  }
};

window.verifyOtpCode = function() {
  const inputs = document.querySelectorAll('.otp-input');
  let userEntered = '';
  inputs.forEach(input => userEntered += input.value.trim());

  if (userEntered !== currentOtpCode) {
    Toast.show('Invalid Code', 'The entered code is incorrect.', 'error');
    return;
  }

  // Code matches, finalize user registration
  const users = AppState.getUsers();
  const newUser = {
    fullName: pendingUserPayload.fullName,
    username: pendingUserPayload.username,
    email: pendingUserPayload.email,
    mobile: pendingUserPayload.mobile,
    password: pendingUserPayload.password,
    joinedDate: new Date().toISOString().split('T')[0],
    role: 'user',
    analysesCount: 0,
    accuracy: 100.0
  };

  users.push(newUser);
  AppState.setUsers(users);
  AppState.setCurrentUser(newUser);

  Toast.show('Account Activated', 'Your verification was successful!', 'success');
  closeOtpModal();

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
};

// Social Sign in Mock Flow
window.googleLoginMock = function() {
  const googleUser = {
    fullName: 'Google User',
    username: 'google_user',
    email: 'google@gmail.com',
    mobile: '+1 (555) 019-2834',
    joinedDate: new Date().toISOString().split('T')[0],
    role: 'user',
    analysesCount: 5,
    accuracy: 94.2
  };

  // Ensure mock database entry exists
  const users = AppState.getUsers();
  if (!users.find(u => u.email === googleUser.email)) {
    users.push(googleUser);
    AppState.setUsers(users);
  }

  AppState.setCurrentUser(googleUser);
  Toast.show('Google Connected', 'Successfully signed in with Google API.', 'success');
  
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
};

window.togglePasswordVisibility = function(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerText = '👁️';
    } else {
      input.type = 'password';
      icon.innerText = '🔒';
    }
  }
};
