/**
 * Tulip Guest House - Mock Data & Real Property Photos
 */

const INITIAL_ROOMS = [
  {
    id: 1,
    roomNumber: "101",
    roomName: "Standard Mountain Room",
    roomType: "Standard",
    price: 7500,
    capacity: 2,
    bedType: "1 Queen Bed",
    viewType: "Mountain View",
    status: "AVAILABLE",
    image: "assets/images/real-photos/real-2.jpg?v=2",
    description: "Cozy and warm standard room featuring traditional wooden finishes and large windows overlooking Murree pine valleys.",
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Mountain View", "Private Bathroom"],
    bookings: [
      { id: "TGH-2026-000099", guestName: "Ali Raza", checkIn: "2026-09-05", checkOut: "2026-09-08", status: "Confirmed" }
    ]
  },
  {
    id: 2,
    roomNumber: "102",
    roomName: "Deluxe Mountain View Room",
    roomType: "Deluxe",
    price: 9500,
    capacity: 3,
    bedType: "1 King Bed",
    viewType: "Panoramic Mountain View",
    status: "BOOKED",
    image: "assets/images/real-photos/real-5.jpg?v=2",
    description: "Spacious deluxe room with private balcony offering direct sunset mountain views over Murree hilltops.",
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Balcony", "Parking", "Room Service", "Private Bathroom"],
    bookings: [
      { id: "TGH-2026-000100", guestName: "Usman Ahmed", checkIn: "2026-09-10", checkOut: "2026-09-14", status: "Confirmed" }
    ]
  },
  {
    id: 3,
    roomNumber: "103",
    roomName: "Family Mountain Suite",
    roomType: "Family",
    price: 12000,
    capacity: 5,
    bedType: "2 King Beds",
    viewType: "Valley View",
    status: "AVAILABLE",
    image: "assets/images/real-photos/real-3.jpg?v=2",
    description: "Ideal for families visiting Murree. Features wooden kitchen accents, comfortable seating lounge, and heated rooms.",
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Kitchenette", "Parking", "Room Service", "Private Bathroom"],
    bookings: []
  },
  {
    id: 4,
    roomNumber: "104",
    roomName: "Executive Pine Lodge Suite",
    roomType: "Executive",
    price: 15000,
    capacity: 4,
    bedType: "1 King + 1 Sofa Bed",
    viewType: "Pine Forest View",
    status: "AVAILABLE",
    image: "assets/images/real-photos/real-4.jpg?v=2",
    description: "Premium wooden lodge room surrounded by pine trees, high ceilings, warm fireplace hearth visual, and ultra-quiet surroundings.",
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Fireplace", "Mountain View", "Parking", "Room Service"],
    bookings: [
      { id: "TGH-2026-000101", guestName: "Sara Khan", checkIn: "2026-09-15", checkOut: "2026-09-18", status: "Confirmed" }
    ]
  },
  {
    id: 5,
    roomNumber: "105",
    roomName: "Premium View Balcony Room",
    roomType: "Premium",
    price: 18000,
    capacity: 3,
    bedType: "1 Super King Bed",
    viewType: "360 Mountain View",
    status: "AVAILABLE",
    image: "assets/images/real-photos/real-1.jpg?v=2",
    description: "Top-floor luxury suite with ceiling-high windows, private timber balcony, and complimentary breakfast service.",
    facilities: ["WiFi", "TV", "Hot Water", "Room Heating", "Balcony", "Free Breakfast", "Parking", "Room Service"],
    bookings: []
  }
];

const INITIAL_BOOKINGS = [
  {
    id: "TGH-2026-000123",
    customerName: "Hamza Malik",
    email: "hamza@example.com",
    phone: "+92 300 1234567",
    cnic: "35202-1234567-1",
    roomId: 2,
    roomNumber: "102",
    roomName: "Deluxe Mountain View Room",
    checkIn: "2026-09-10",
    checkOut: "2026-09-14",
    guests: 2,
    amount: 38000,
    status: "Confirmed",
    created: "2026-09-01"
  }
];

const DEFAULT_SETTINGS = {
  hotelName: "Tulip Guest House",
  phone: "+92 300 1234567",
  email: "info@tulipguesthouse.com",
  address: "Murree Expressway, Murree, Punjab, Pakistan",
  taxRate: 5,
  currency: "PKR"
};

// Force update storage with real property photos
function initStorage() {
  localStorage.setItem('mm_rooms', JSON.stringify(INITIAL_ROOMS));
  if (!localStorage.getItem('mm_bookings')) {
    localStorage.setItem('mm_bookings', JSON.stringify(INITIAL_BOOKINGS));
  }
  localStorage.setItem('mm_settings', JSON.stringify(DEFAULT_SETTINGS));
}

initStorage();

function getStoredRooms() {
  return JSON.parse(localStorage.getItem('mm_rooms')) || INITIAL_ROOMS;
}

function saveStoredRooms(rooms) {
  localStorage.setItem('mm_rooms', JSON.stringify(rooms));
}

function getStoredBookings() {
  return JSON.parse(localStorage.getItem('mm_bookings')) || INITIAL_BOOKINGS;
}

function saveStoredBookings(bookings) {
  localStorage.setItem('mm_bookings', JSON.stringify(bookings));
}

function getStoredSettings() {
  return JSON.parse(localStorage.getItem('mm_settings')) || DEFAULT_SETTINGS;
}

function saveStoredSettings(settings) {
  localStorage.setItem('mm_settings', JSON.stringify(settings));
}
