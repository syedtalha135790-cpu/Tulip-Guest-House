/**
 * Murree Motels - Core Booking Logic & Availability Checking
 */

// Helper: Check Date Overlap
function isDateOverlapping(checkInA, checkOutA, checkInB, checkOutB) {
  const inA = new Date(checkInA);
  const outA = new Date(checkOutA);
  const inB = new Date(checkInB);
  const outB = new Date(checkOutB);
  return (inA < outB && outA > inB);
}

// Helper: Calculate Nights
function calculateNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 0;
  const inDate = new Date(checkInStr);
  const outDate = new Date(checkOutStr);
  const diffTime = outDate - inDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Core Function: Check Availability of a Room for Date Range
function checkRoomAvailabilityForDates(room, checkIn, checkOut) {
  if (room.status === "MAINTENANCE") {
    return { available: false, reason: "Under Maintenance", dates: "" };
  }
  
  if (!room.bookings || room.bookings.length === 0) {
    return { available: true, reason: "Available", dates: "" };
  }

  for (const b of room.bookings) {
    if (b.status === "Cancelled") continue;
    if (isDateOverlapping(checkIn, checkOut, b.checkIn, b.checkOut)) {
      return { 
        available: false, 
        reason: `Booked from ${formatDateString(b.checkIn)} to ${formatDateString(b.checkOut)}`,
        checkIn: b.checkIn,
        checkOut: b.checkOut
      };
    }
  }

  return { available: true, reason: "Available", dates: "" };
}

function formatDateString(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Setup Date Inputs with min today
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const checkInInputs = document.querySelectorAll('input[name="checkIn"], #checkInDate');
  const checkOutInputs = document.querySelectorAll('input[name="checkOut"], #checkOutDate');

  checkInInputs.forEach(input => {
    input.min = today;
    if (!input.value) input.value = today;
    input.addEventListener('change', (e) => {
      const selectedIn = e.target.value;
      const nextDay = new Date(new Date(selectedIn).getTime() + 86400000).toISOString().split('T')[0];
      checkOutInputs.forEach(outInput => {
        outInput.min = nextDay;
        if (outInput.value <= selectedIn) {
          outInput.value = nextDay;
        }
      });
      triggerPriceUpdate();
    });
  });

  checkOutInputs.forEach(input => {
    input.min = tomorrow;
    if (!input.value) input.value = tomorrow;
    input.addEventListener('change', () => {
      triggerPriceUpdate();
    });
  });
});

function triggerPriceUpdate() {
  if (typeof updateRoomDetailsBookingPanel === 'function') {
    updateRoomDetailsBookingPanel();
  }
}
