/**
 * Tulip Guest House - Admin Dashboard & Management Scripts
 */

function checkAdminAuth() {
  const admin = getCurrentAdmin();
  if (!admin && !window.location.pathname.includes('admin-login.html')) {
    window.location.href = 'admin-login.html';
  }
}

// Render Admin Dashboard Stats
function renderAdminDashboard() {
  const rooms = getStoredRooms();
  const bookings = getStoredBookings();

  const totalRoomsElem = document.getElementById('statTotalRooms');
  const availableRoomsElem = document.getElementById('statAvailableRooms');
  const bookedRoomsElem = document.getElementById('statBookedRooms');
  const totalBookingsElem = document.getElementById('statTotalBookings');

  if (totalRoomsElem) totalRoomsElem.textContent = rooms.length;
  if (availableRoomsElem) availableRoomsElem.textContent = rooms.filter(r => r.status === 'AVAILABLE').length;
  if (bookedRoomsElem) bookedRoomsElem.textContent = rooms.filter(r => r.status === 'BOOKED').length;
  if (totalBookingsElem) totalBookingsElem.textContent = bookings.length;

  renderRecentAdminBookingsTable();
}

function renderRecentAdminBookingsTable() {
  const tableBody = document.getElementById('recentBookingsTableBody');
  if (!tableBody) return;

  const bookings = getStoredBookings();
  tableBody.innerHTML = bookings.slice(0, 5).map(b => `
    <tr>
      <td class="fw-bold text-success">${b.id}</td>
      <td>${b.customerName}</td>
      <td>Room ${b.roomNumber} - ${b.roomName}</td>
      <td>${b.checkIn}</td>
      <td>${b.checkOut}</td>
      <td>PKR ${b.amount.toLocaleString()}</td>
      <td><span class="badge ${b.status === 'Confirmed' ? 'badge-available' : b.status === 'Completed' ? 'bg-secondary text-white' : 'badge-booked'}">${b.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick="viewBookingDetails('${b.id}')"><i class="bi bi-eye"></i></button>
      </td>
    </tr>
  `).join('');
}

// Render Admin Rooms Management Table
function renderAdminRoomsTable() {
  const tableBody = document.getElementById('adminRoomsTableBody');
  if (!tableBody) return;

  const rooms = getStoredRooms();
  tableBody.innerHTML = rooms.map(r => `
    <tr>
      <td class="fw-bold">#${r.roomNumber}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${r.image}" class="rounded" style="width: 50px; height: 40px; object-fit: cover;" alt="${r.roomName}">
          <div>
            <div class="fw-bold">${r.roomName}</div>
            <small class="text-muted">${r.roomType}</small>
          </div>
        </div>
      </td>
      <td class="fw-bold text-success">PKR ${r.price.toLocaleString()}</td>
      <td>${r.capacity} Guests</td>
      <td>${r.viewType}</td>
      <td>
        <span class="badge badge-status ${r.status === 'AVAILABLE' ? 'badge-available' : r.status === 'BOOKED' ? 'badge-booked' : 'badge-maintenance'}">
          ${r.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-sage me-1" onclick="openEditRoomModal(${r.id})" title="Edit Room"><i class="bi bi-pencil"></i> Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteRoom(${r.id})" title="Delete Room"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Image Preview & Upload Handlers for Add Room Modal
function previewAddRoomImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('addRoomPreviewImg').src = dataUrl;
    document.getElementById('addRoomImageValue').value = dataUrl;
    document.getElementById('addRoomImageName').textContent = file.name;
    const badge = document.getElementById('addRoomBadge');
    if (badge) {
      badge.textContent = "New Image Loaded";
      badge.className = "badge bg-primary mb-1";
    }
  };
  reader.readAsDataURL(file);
}

function removeAddRoomImage() {
  const defaultImg = "assets/images/hotel-2.jpg";
  document.getElementById('addRoomFileInput').value = "";
  document.getElementById('addRoomPreviewImg').src = defaultImg;
  document.getElementById('addRoomImageValue').value = defaultImg;
  document.getElementById('addRoomImageName').textContent = "assets/images/hotel-2.jpg (Default)";
  const badge = document.getElementById('addRoomBadge');
  if (badge) {
    badge.textContent = "Default Image";
    badge.className = "badge bg-secondary mb-1";
  }
}

// Image Preview & Upload Handlers for Edit Room Modal
function previewEditRoomImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('editRoomPreviewImg').src = dataUrl;
    document.getElementById('editImageValue').value = dataUrl;
    document.getElementById('editImageCustomUrl').value = dataUrl.substring(0, 45) + '... (Uploaded File)';
    document.getElementById('editRoomImageSource').textContent = `File Upload: ${file.name}`;

    const badge = document.getElementById('editRoomBadge');
    if (badge) {
      badge.textContent = "New Image Selected";
      badge.className = "badge bg-primary mb-1";
    }

    showToast('New room image loaded! Click "Update Room Details" to save.', 'success');
  };
  reader.readAsDataURL(file);
}

function removeEditRoomImage() {
  const placeholderImg = "assets/images/hotel-2.jpg";
  document.getElementById('editRoomFileInput').value = "";
  document.getElementById('editRoomPreviewImg').src = placeholderImg;
  document.getElementById('editImageValue').value = placeholderImg;
  document.getElementById('editImageCustomUrl').value = placeholderImg;
  document.getElementById('editRoomImageSource').textContent = "Image Removed (Using Default Placeholder)";

  const badge = document.getElementById('editRoomBadge');
  if (badge) {
    badge.textContent = "Image Removed";
    badge.className = "badge bg-danger mb-1";
  }

  showToast('Image removed. Reverted to default placeholder.', 'warning');
}

function updateImageFromUrlInput(url) {
  if (!url) return;
  document.getElementById('editRoomPreviewImg').src = url;
  document.getElementById('editImageValue').value = url;
  document.getElementById('editRoomImageSource').textContent = url;

  const badge = document.getElementById('editRoomBadge');
  if (badge) {
    badge.textContent = "URL Updated";
    badge.className = "badge bg-info text-dark mb-1";
  }
}

// Add Room Handler
function handleAddRoom(event) {
  event.preventDefault();
  const form = event.target;
  const rooms = getStoredRooms();

  const newRoom = {
    id: Date.now(),
    roomNumber: form.roomNumber.value,
    roomName: form.roomName.value,
    roomType: form.roomType.value,
    price: parseInt(form.price.value),
    capacity: parseInt(form.capacity.value),
    bedType: form.bedType.value,
    viewType: form.viewType.value,
    status: form.status.value,
    image: form.image.value || "assets/images/hotel-2.jpg",
    description: form.description.value,
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Mountain View"],
    bookings: []
  };

  rooms.push(newRoom);
  saveStoredRooms(rooms);
  
  const modalElem = document.getElementById('addRoomModal');
  const modal = bootstrap.Modal.getInstance(modalElem);
  if (modal) modal.hide();
  form.reset();

  showToast('New room added successfully!');
  renderAdminRoomsTable();
}

// Open Edit Room Modal & Populate Fields
function openEditRoomModal(id) {
  const rooms = getStoredRooms();
  const room = rooms.find(r => r.id === id);
  if (!room) return;

  const form = document.getElementById('editRoomForm');
  if (!form) return;

  form.editRoomId.value = room.id;
  form.editRoomNumber.value = room.roomNumber;
  form.editRoomName.value = room.roomName;
  form.editRoomType.value = room.roomType;
  form.editPrice.value = room.price;
  form.editCapacity.value = room.capacity;
  form.editBedType.value = room.bedType || "";
  form.editViewType.value = room.viewType || "";
  form.editStatus.value = room.status;

  // Set image fields & preview
  const currentImage = room.image || "assets/images/hotel-2.jpg";
  document.getElementById('editImageValue').value = currentImage;
  document.getElementById('editRoomPreviewImg').src = currentImage;
  document.getElementById('editImageCustomUrl').value = currentImage;
  document.getElementById('editRoomImageSource').textContent = currentImage.startsWith('data:') ? 'Custom Uploaded Base64 Image' : currentImage;
  document.getElementById('editRoomFileInput').value = "";

  const badge = document.getElementById('editRoomBadge');
  if (badge) {
    badge.textContent = "Active Image";
    badge.className = "badge bg-success mb-1";
  }

  form.editDescription.value = room.description || "";

  const modal = new bootstrap.Modal(document.getElementById('editRoomModal'));
  modal.show();
}

// Edit Room Handler
function handleEditRoom(event) {
  event.preventDefault();
  const form = event.target;
  const roomId = parseInt(form.editRoomId.value);
  const rooms = getStoredRooms();
  const room = rooms.find(r => r.id === roomId);

  if (room) {
    room.roomNumber = form.editRoomNumber.value;
    room.roomName = form.editRoomName.value;
    room.roomType = form.editRoomType.value;
    room.price = parseInt(form.editPrice.value);
    room.capacity = parseInt(form.editCapacity.value);
    room.bedType = form.editBedType.value;
    room.viewType = form.editViewType.value;
    room.status = form.editStatus.value;
    room.image = document.getElementById('editImageValue').value || "assets/images/hotel-2.jpg";
    room.description = form.editDescription.value;

    saveStoredRooms(rooms);

    const modalElem = document.getElementById('editRoomModal');
    const modal = bootstrap.Modal.getInstance(modalElem);
    if (modal) modal.hide();

    showToast(`Room #${room.roomNumber} updated successfully! Image & details saved.`);
    renderAdminRoomsTable();
  }
}

// Delete Room Handler
function deleteRoom(id) {
  if (confirm("Are you sure you want to delete this room?")) {
    let rooms = getStoredRooms();
    rooms = rooms.filter(r => r.id !== id);
    saveStoredRooms(rooms);
    showToast('Room deleted', 'danger');
    renderAdminRoomsTable();
  }
}

// Render Settings Page Form
function renderAdminSettings() {
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  const settings = getStoredSettings();
  form.hotelName.value = settings.hotelName || "Tulip Guest House";
  form.phone.value = settings.phone || "+92 300 1234567";
  form.email.value = settings.email || "info@tulipguesthouse.com";
  form.address.value = settings.address || "Murree Expressway, Murree, Pakistan";
  form.taxRate.value = settings.taxRate || 5;
  form.currency.value = settings.currency || "PKR";
}

// Save Settings Handler
function handleSaveSettings(event) {
  event.preventDefault();
  const form = event.target;
  const settings = {
    hotelName: form.hotelName.value,
    phone: form.phone.value,
    email: form.email.value,
    address: form.address.value,
    taxRate: parseFloat(form.taxRate.value),
    currency: form.currency.value
  };

  saveStoredSettings(settings);
  showToast('Guest house settings updated successfully!');
}

// Render Availability Calendar Matrix
function renderAvailabilityMatrix() {
  const matrixContainer = document.getElementById('availabilityMatrixTable');
  if (!matrixContainer) return;

  const rooms = getStoredRooms();
  const dates = ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18"];

  let headerHTML = `
    <thead>
      <tr>
        <th style="min-width: 180px;">Room Details</th>
  `;
  dates.forEach(d => {
    const formatted = new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    headerHTML += `<th class="text-center">${formatted}</th>`;
  });
  headerHTML += `</tr></thead>`;

  let bodyHTML = `<tbody>`;
  rooms.forEach(r => {
    bodyHTML += `<tr>
      <td class="fw-bold bg-white">
        <div>Room ${r.roomNumber}</div>
        <small class="text-muted fw-normal">${r.roomName}</small>
      </td>
    `;

    dates.forEach(d => {
      let isBooked = false;
      if (r.bookings) {
        for (const b of r.bookings) {
          if (d >= b.checkIn && d < b.checkOut && b.status !== 'Cancelled') {
            isBooked = true;
            break;
          }
        }
      }

      if (r.status === 'MAINTENANCE') {
        bodyHTML += `<td class="cell-maintenance" title="Room in Maintenance">MAINT</td>`;
      } else if (isBooked) {
        bodyHTML += `<td class="cell-booked" title="Booked">BOOKED</td>`;
      } else {
        bodyHTML += `<td class="cell-free" title="Available">FREE</td>`;
      }
    });

    bodyHTML += `</tr>`;
  });
  bodyHTML += `</tbody>`;

  matrixContainer.innerHTML = headerHTML + bodyHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('admin-')) {
    checkAdminAuth();
    renderAdminDashboard();
    renderAdminRoomsTable();
    renderAdminSettings();
    renderAvailabilityMatrix();
  }
});
