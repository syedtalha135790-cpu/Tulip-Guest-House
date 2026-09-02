/**
 * Tulip Guest House - Customer & Admin Authentication Module
 */

function getCurrentCustomer() {
  const user = localStorage.getItem('mm_current_user');
  return user ? JSON.parse(user) : null;
}

function getCurrentAdmin() {
  const admin = localStorage.getItem('mm_admin_user');
  return admin ? JSON.parse(admin) : null;
}

function loginCustomer(email, password) {
  if (!email || !password) {
    return { success: false, message: "Please fill in all fields." };
  }
  const user = {
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email: email,
    phone: "+92 300 1234567"
  };
  localStorage.setItem('mm_current_user', JSON.stringify(user));
  return { success: true, user: user };
}

function signupCustomer(name, email, phone, password) {
  if (!name || !email || !password) {
    return { success: false, message: "Please complete all required fields." };
  }
  const user = { name, email, phone };
  localStorage.setItem('mm_current_user', JSON.stringify(user));
  return { success: true, user: user };
}

function logoutCustomer() {
  localStorage.removeItem('mm_current_user');
  window.location.href = 'index.html';
}

function loginAdmin(email, password) {
  if (email === "admin@tulipguesthouse.com" || email === "admin@murreemotels.com" && password === "admin123") {
    const admin = { name: "System Admin", email: email, role: "Super Admin" };
    localStorage.setItem('mm_admin_user', JSON.stringify(admin));
    return { success: true };
  }
  if (email && password) {
    const admin = { name: "Manager", email: email, role: "Hotel Manager" };
    localStorage.setItem('mm_admin_user', JSON.stringify(admin));
    return { success: true };
  }
  return { success: false, message: "Invalid admin credentials." };
}

function logoutAdmin() {
  localStorage.removeItem('mm_admin_user');
  window.location.href = 'admin-login.html';
}

// Navbar authentication state renderer
function renderNavbarAuth() {
  const container = document.getElementById('navbarAuthButtons');
  if (!container) return;

  const customer = getCurrentCustomer();

  if (customer) {
    container.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-sage dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle fs-5"></i>
          <span>${customer.name}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><a class="dropdown-item" href="customer-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>My Dashboard</a></li>
          <li><a class="dropdown-item" href="my-bookings.html"><i class="bi bi-journal-bookmark me-2"></i>My Bookings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" onclick="logoutCustomer()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
        </ul>
      </div>
      <a href="rooms.html" class="btn btn-sage ms-2">Book Now</a>
    `;
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn btn-link text-decoration-none text-dark fw-semibold me-2">Login</a>
      <a href="signup.html" class="btn btn-outline-sage me-2">Sign Up</a>
      <a href="rooms.html" class="btn btn-sage">Book Now</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbarAuth();
});
