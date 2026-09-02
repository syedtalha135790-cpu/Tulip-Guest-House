/**
 * Murree Motels - Laravel API Connector Module
 * Connects frontend HTML/JS interface directly to Laravel REST API endpoints
 */

const API_BASE_URL = 'http://localhost:8000/api'; // Update to your Laravel server URL

function getAuthHeaders() {
  const token = localStorage.getItem('mm_auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Fetch Rooms from Laravel Backend
async function laravelGetRooms(filters = {}) {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/rooms?${params}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.warn('Laravel API offline, using local storage fallback.', err);
    return getStoredRooms();
  }
}

// Fetch Single Room Details
async function laravelGetRoom(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    const rooms = getStoredRooms();
    return rooms.find(r => r.id === parseInt(id)) || null;
  }
}

// Create New Booking in Laravel
async function laravelCreateBooking(bookingPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingPayload)
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Could not connect to Laravel backend API.' };
  }
}

// Admin: Save Room Edits (Dynamic Price, Name, Status Update)
async function laravelAdminUpdateRoom(id, roomPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomPayload)
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Could not connect to Laravel backend API.' };
  }
}

// Admin: Add New Room
async function laravelAdminAddRoom(roomPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomPayload)
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Could not connect to Laravel backend API.' };
  }
}

// Admin: Delete Room
async function laravelAdminDeleteRoom(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Could not connect to Laravel backend API.' };
  }
}

// Admin: Get Availability Calendar Matrix
async function laravelAdminGetCalendar() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/availability-calendar`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    console.warn('Laravel API offline, using local calendar renderer.', err);
    return null;
  }
}
