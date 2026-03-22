export type ShowroomType = 'BIKE' | 'CAR' | 'EV' | 'MULTI';

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text';
  placeholder?: string;
  options?: string[];
}

export interface ShowroomConfig {
  label: string;
  icon: string;
  emoji: string;
  color: string;
  fuelTypes: FuelType[];
  vehicleLabel: string;
  vehicleLabelPlural: string;
  specificFields: FieldConfig[];
  evFields: FieldConfig[];
  popularBrands: string[];
  bookingLabel: string;
  stockLabel: string;
}

export const showroomConfig: Record<ShowroomType, ShowroomConfig> = {
  BIKE: {
    label: 'Bike Showroom',
    icon: 'Bike',
    emoji: '🏍️',
    color: 'orange',
    fuelTypes: ['PETROL', 'ELECTRIC'],
    vehicleLabel: 'Bike',
    vehicleLabelPlural: 'Bikes',
    specificFields: [
      { key: 'cc', label: 'Engine CC', type: 'number', placeholder: 'e.g. 150' },
      { key: 'mileage', label: 'Mileage (km/l)', type: 'number', placeholder: 'e.g. 50' },
      { key: 'topSpeed', label: 'Top Speed (km/h)', type: 'number', placeholder: 'e.g. 120' },
      { key: 'kerbWeight', label: 'Kerb Weight (kg)', type: 'number', placeholder: 'e.g. 140' },
    ],
    evFields: [
      { key: 'batteryCapacity', label: 'Battery (kWh)', type: 'number', placeholder: 'e.g. 3.0' },
      { key: 'range', label: 'Range (km)', type: 'number', placeholder: 'e.g. 120' },
      { key: 'chargingTime', label: 'Charging Time (hrs)', type: 'number', placeholder: 'e.g. 4' },
      { key: 'motorPower', label: 'Motor Power (kW)', type: 'number', placeholder: 'e.g. 4.5' },
    ],
    popularBrands: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Ola Electric', 'Ather'],
    bookingLabel: 'Book Bike',
    stockLabel: 'Bike Stock',
  },
  CAR: {
    label: 'Car Showroom',
    icon: 'Car',
    emoji: '🚗',
    color: 'blue',
    fuelTypes: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'],
    vehicleLabel: 'Car',
    vehicleLabelPlural: 'Cars',
    specificFields: [
      { key: 'cc', label: 'Engine CC', type: 'number', placeholder: 'e.g. 1500' },
      { key: 'mileage', label: 'Mileage (km/l)', type: 'number', placeholder: 'e.g. 18' },
      { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number', placeholder: 'e.g. 5' },
      { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'] },
      { key: 'bootSpace', label: 'Boot Space (liters)', type: 'number', placeholder: 'e.g. 350' },
      { key: 'bodyType', label: 'Body Type', type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Coupe', 'Convertible', 'Pickup'] },
    ],
    evFields: [
      { key: 'batteryCapacity', label: 'Battery (kWh)', type: 'number', placeholder: 'e.g. 40' },
      { key: 'range', label: 'Range (km)', type: 'number', placeholder: 'e.g. 400' },
      { key: 'chargingTime', label: 'Fast Charge Time (min)', type: 'number', placeholder: 'e.g. 45' },
      { key: 'motorPower', label: 'Motor Power (kW)', type: 'number', placeholder: 'e.g. 135' },
    ],
    popularBrands: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG', 'Skoda', 'Volkswagen'],
    bookingLabel: 'Book Car',
    stockLabel: 'Car Stock',
  },
  EV: {
    label: 'EV Showroom',
    icon: 'Zap',
    emoji: '⚡',
    color: 'green',
    fuelTypes: ['ELECTRIC'],
    vehicleLabel: 'EV',
    vehicleLabelPlural: 'EVs',
    specificFields: [
      { key: 'vehicleCategory', label: 'Category', type: 'select', options: ['Electric Bike', 'Electric Scooter', 'Electric Car', 'Electric Auto', 'Electric Bus'] },
      { key: 'batteryCapacity', label: 'Battery Capacity (kWh)', type: 'number', placeholder: 'e.g. 3.0' },
      { key: 'range', label: 'Range per Charge (km)', type: 'number', placeholder: 'e.g. 120' },
      { key: 'chargingTime', label: 'Full Charge Time (hrs)', type: 'number', placeholder: 'e.g. 5' },
      { key: 'fastChargeTime', label: 'Fast Charge 0-80% (min)', type: 'number', placeholder: 'e.g. 45' },
      { key: 'motorPower', label: 'Motor Power (kW)', type: 'number', placeholder: 'e.g. 5' },
      { key: 'topSpeed', label: 'Top Speed (km/h)', type: 'number', placeholder: 'e.g. 80' },
      { key: 'warrantyYears', label: 'Battery Warranty (years)', type: 'number', placeholder: 'e.g. 3' },
    ],
    evFields: [],
    popularBrands: ['Ola Electric', 'Ather', 'Tata EV', 'MG EV', 'BYD', 'Revolt', 'Okinawa', 'Hero Electric', 'TVS iQube', 'Bajaj Chetak'],
    bookingLabel: 'Book EV',
    stockLabel: 'EV Stock',
  },
  MULTI: {
    label: 'Multi-Vehicle Showroom',
    icon: 'Store',
    emoji: '🏪',
    color: 'purple',
    fuelTypes: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'],
    vehicleLabel: 'Vehicle',
    vehicleLabelPlural: 'Vehicles',
    specificFields: [],
    evFields: [],
    popularBrands: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Ola Electric'],
    bookingLabel: 'Book Vehicle',
    stockLabel: 'Vehicle Stock',
  },
};

// Mock data per showroom type
export interface MockVehicle {
  id: string;
  model: string;
  variant: string;
  color: string;
  engineNo: string;
  chassisNo: string;
  price: number;
  status: 'Available' | 'Booked' | 'Sold';
  purchaseDate: string;
  photo?: string;
  fuelType: FuelType;
  brand: string;
  // Dynamic fields stored as record
  specs: Record<string, string | number>;
}

export const mockVehiclesByType: Record<ShowroomType, MockVehicle[]> = {
  BIKE: [
    { id: 'B001', model: 'Hero Splendor+', variant: 'STD', color: 'Black', engineNo: 'ENG-HS-001', chassisNo: 'CHS-HS-001', price: 78000, status: 'Available', purchaseDate: '2024-03-01', brand: 'Hero', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop', specs: { cc: 97, mileage: 70, topSpeed: 90, kerbWeight: 112 } },
    { id: 'B002', model: 'Honda Activa 6G', variant: 'STD', color: 'Pearl White', engineNo: 'ENG-HA-002', chassisNo: 'CHS-HA-002', price: 78000, status: 'Available', purchaseDate: '2024-03-05', brand: 'Honda', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop', specs: { cc: 109, mileage: 55, topSpeed: 85, kerbWeight: 107 } },
    { id: 'B003', model: 'Bajaj Pulsar 150', variant: 'Disc', color: 'Racing Red', engineNo: 'ENG-BP-003', chassisNo: 'CHS-BP-003', price: 112000, status: 'Booked', purchaseDate: '2024-03-08', brand: 'Bajaj', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop', specs: { cc: 149, mileage: 50, topSpeed: 120, kerbWeight: 148 } },
    { id: 'B004', model: 'Royal Enfield Classic 350', variant: 'Chrome', color: 'Silver', engineNo: 'ENG-RE-004', chassisNo: 'CHS-RE-004', price: 210000, status: 'Available', purchaseDate: '2024-03-10', brand: 'Royal Enfield', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=300&fit=crop', specs: { cc: 349, mileage: 35, topSpeed: 120, kerbWeight: 195 } },
    { id: 'B005', model: 'TVS Jupiter', variant: 'Classic', color: 'Titanium Grey', engineNo: 'ENG-TJ-005', chassisNo: 'CHS-TJ-005', price: 78000, status: 'Sold', purchaseDate: '2024-02-20', brand: 'TVS', fuelType: 'PETROL', specs: { cc: 109, mileage: 55, topSpeed: 85, kerbWeight: 108 } },
    { id: 'B006', model: 'Ola S1 Pro', variant: 'Pro', color: 'Jet Black', engineNo: 'ENG-OLA-006', chassisNo: 'CHS-OLA-006', price: 140000, status: 'Available', purchaseDate: '2024-03-15', brand: 'Ola Electric', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop', specs: { batteryCapacity: 3.97, range: 170, chargingTime: 6.5, motorPower: 8.5, topSpeed: 116 } },
  ],
  CAR: [
    { id: 'C001', model: 'Maruti Swift', variant: 'VXI', color: 'Pearl White', engineNo: 'ENG-MS-001', chassisNo: 'CHS-MS-001', price: 720000, status: 'Available', purchaseDate: '2024-03-01', brand: 'Maruti Suzuki', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop', specs: { cc: 1197, mileage: 22, seatingCapacity: 5, transmission: 'Manual', bootSpace: 268, bodyType: 'Hatchback' } },
    { id: 'C002', model: 'Hyundai Creta', variant: 'SX', color: 'Phantom Black', engineNo: 'ENG-HC-002', chassisNo: 'CHS-HC-002', price: 1650000, status: 'Booked', purchaseDate: '2024-03-05', brand: 'Hyundai', fuelType: 'DIESEL', photo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop', specs: { cc: 1493, mileage: 21, seatingCapacity: 5, transmission: 'Automatic', bootSpace: 433, bodyType: 'SUV' } },
    { id: 'C003', model: 'Tata Nexon', variant: 'XZ+', color: 'Flame Red', engineNo: 'ENG-TN-003', chassisNo: 'CHS-TN-003', price: 1200000, status: 'Available', purchaseDate: '2024-03-08', brand: 'Tata', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop', specs: { cc: 1199, mileage: 17, seatingCapacity: 5, transmission: 'Manual', bootSpace: 350, bodyType: 'SUV' } },
    { id: 'C004', model: 'Kia Seltos', variant: 'HTX+', color: 'Gravity Grey', engineNo: 'ENG-KS-004', chassisNo: 'CHS-KS-004', price: 1550000, status: 'Available', purchaseDate: '2024-03-10', brand: 'Kia', fuelType: 'DIESEL', photo: 'https://images.unsplash.com/photo-1606611013016-969c19ba27f5?w=400&h=300&fit=crop', specs: { cc: 1493, mileage: 20, seatingCapacity: 5, transmission: 'Automatic', bootSpace: 433, bodyType: 'SUV' } },
    { id: 'C005', model: 'Mahindra XUV700', variant: 'AX7', color: 'Deep Forest', engineNo: 'ENG-MX-005', chassisNo: 'CHS-MX-005', price: 2200000, status: 'Sold', purchaseDate: '2024-02-20', brand: 'Mahindra', fuelType: 'DIESEL', specs: { cc: 2198, mileage: 16, seatingCapacity: 7, transmission: 'Automatic', bootSpace: 451, bodyType: 'SUV' } },
    { id: 'C006', model: 'Tata Punch EV', variant: 'Empowered+', color: 'Pristine White', engineNo: 'ENG-TP-006', chassisNo: 'CHS-TP-006', price: 1250000, status: 'Available', purchaseDate: '2024-03-15', brand: 'Tata', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop', specs: { batteryCapacity: 25, range: 315, chargingTime: 60, motorPower: 83, seatingCapacity: 5, bodyType: 'SUV' } },
  ],
  EV: [
    { id: 'E001', model: 'Ola S1 Pro', variant: 'Pro', color: 'Jet Black', engineNo: 'ENG-OLA-001', chassisNo: 'CHS-OLA-001', price: 140000, status: 'Available', purchaseDate: '2024-03-01', brand: 'Ola Electric', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop', specs: { vehicleCategory: 'Electric Scooter', batteryCapacity: 3.97, range: 170, chargingTime: 6.5, fastChargeTime: 30, motorPower: 8.5, topSpeed: 116, warrantyYears: 3 } },
    { id: 'E002', model: 'Ather 450X', variant: 'Gen3', color: 'Space Grey', engineNo: 'ENG-ATH-002', chassisNo: 'CHS-ATH-002', price: 155000, status: 'Available', purchaseDate: '2024-03-05', brand: 'Ather', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', specs: { vehicleCategory: 'Electric Scooter', batteryCapacity: 3.7, range: 150, chargingTime: 5.5, fastChargeTime: 30, motorPower: 6.4, topSpeed: 90, warrantyYears: 3 } },
    { id: 'E003', model: 'Tata Nexon EV', variant: 'Max LR', color: 'Pristine White', engineNo: 'ENG-TNE-003', chassisNo: 'CHS-TNE-003', price: 1850000, status: 'Booked', purchaseDate: '2024-03-08', brand: 'Tata EV', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop', specs: { vehicleCategory: 'Electric Car', batteryCapacity: 40.5, range: 437, chargingTime: 15, fastChargeTime: 56, motorPower: 105, topSpeed: 140, warrantyYears: 8 } },
    { id: 'E004', model: 'MG ZS EV', variant: 'Exclusive', color: 'Aurora Silver', engineNo: 'ENG-MG-004', chassisNo: 'CHS-MG-004', price: 2500000, status: 'Available', purchaseDate: '2024-03-10', brand: 'MG EV', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1606611013016-969c19ba27f5?w=400&h=300&fit=crop', specs: { vehicleCategory: 'Electric Car', batteryCapacity: 50.3, range: 461, chargingTime: 8.5, fastChargeTime: 50, motorPower: 130, topSpeed: 175, warrantyYears: 8 } },
    { id: 'E005', model: 'Revolt RV400', variant: 'Premium', color: 'Rebel Red', engineNo: 'ENG-RV-005', chassisNo: 'CHS-RV-005', price: 145000, status: 'Sold', purchaseDate: '2024-02-20', brand: 'Revolt', fuelType: 'ELECTRIC', specs: { vehicleCategory: 'Electric Bike', batteryCapacity: 3.24, range: 150, chargingTime: 4.5, fastChargeTime: 0, motorPower: 3.24, topSpeed: 85, warrantyYears: 5 } },
    { id: 'E006', model: 'TVS iQube', variant: 'ST', color: 'Copper Bronze', engineNo: 'ENG-TVS-006', chassisNo: 'CHS-TVS-006', price: 130000, status: 'Available', purchaseDate: '2024-03-15', brand: 'TVS iQube', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop', specs: { vehicleCategory: 'Electric Scooter', batteryCapacity: 5.1, range: 150, chargingTime: 5, fastChargeTime: 0, motorPower: 4.4, topSpeed: 78, warrantyYears: 3 } },
  ],
  MULTI: [
    { id: 'M001', model: 'Hero Splendor+', variant: 'STD', color: 'Black', engineNo: 'ENG-HS-001', chassisNo: 'CHS-HS-001', price: 78000, status: 'Available', purchaseDate: '2024-03-01', brand: 'Hero', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop', specs: { cc: 97, mileage: 70 } },
    { id: 'M002', model: 'Maruti Swift', variant: 'VXI', color: 'Pearl White', engineNo: 'ENG-MS-002', chassisNo: 'CHS-MS-002', price: 720000, status: 'Available', purchaseDate: '2024-03-05', brand: 'Maruti', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop', specs: { cc: 1197, bodyType: 'Hatchback' } },
    { id: 'M003', model: 'Ola S1 Pro', variant: 'Pro', color: 'Jet Black', engineNo: 'ENG-OLA-003', chassisNo: 'CHS-OLA-003', price: 140000, status: 'Booked', purchaseDate: '2024-03-08', brand: 'Ola Electric', fuelType: 'ELECTRIC', photo: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop', specs: { range: 170, batteryCapacity: 3.97 } },
    { id: 'M004', model: 'Hyundai Creta', variant: 'SX', color: 'Phantom Black', engineNo: 'ENG-HC-004', chassisNo: 'CHS-HC-004', price: 1650000, status: 'Available', purchaseDate: '2024-03-10', brand: 'Hyundai', fuelType: 'DIESEL', photo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop', specs: { cc: 1493, bodyType: 'SUV' } },
    { id: 'M005', model: 'Tata Nexon EV', variant: 'Max', color: 'Pristine White', engineNo: 'ENG-TNE-005', chassisNo: 'CHS-TNE-005', price: 1850000, status: 'Sold', purchaseDate: '2024-02-20', brand: 'Tata', fuelType: 'ELECTRIC', specs: { range: 437, batteryCapacity: 40.5 } },
    { id: 'M006', model: 'Bajaj Pulsar 150', variant: 'Disc', color: 'Racing Red', engineNo: 'ENG-BP-006', chassisNo: 'CHS-BP-006', price: 112000, status: 'Available', purchaseDate: '2024-03-15', brand: 'Bajaj', fuelType: 'PETROL', photo: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop', specs: { cc: 149, mileage: 50 } },
  ],
};

// Showroom type descriptions for onboarding
export const showroomTypeDescriptions: Record<ShowroomType, string> = {
  BIKE: 'Two-wheelers (Petrol & Electric)',
  CAR: 'Four-wheelers (Petrol, Diesel, CNG, Electric, Hybrid)',
  EV: 'Pure Electric Vehicles',
  MULTI: 'All types combined',
};
