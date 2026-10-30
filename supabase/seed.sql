-- ============================================================
-- ServisIn — demo seed data (optional)
-- Run AFTER 20261030000000_init_servisin.sql
-- ============================================================

insert into public."User" (
  id, name, phone, email, "passwordHash", role, status, tier,
  "avatarUrl", rating, "bnspCertified"
) values
  (
    'usr-cst-001', 'Rizky Pratama', '081298453210', 'rizky.pratama@gmail.com',
    'password123', 'CUSTOMER', 'ACTIVE', 'VIP',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
    4.9, false
  ),
  (
    'usr-mec-001', 'Bambang Sudiro', '081377889900', 'bambang.sudiro@servisin.id',
    'password123', 'MECHANIC', 'ACTIVE', 'REGULAR',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80',
    4.92, true
  ),
  (
    'usr-adm-001', 'Admin Pusat ServisIn', '081100223344', 'admin@servisin.id',
    'admin123', 'ADMIN', 'ACTIVE', 'REGULAR',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    4.9, false
  )
on conflict (id) do nothing;

insert into public."MechanicProfile" (
  id, "userId", "ktpNumber", "simNumber", "bnspCertNumber", "workshopName",
  "currentLat", "currentLng", "isOnline", "walletBalance", "escrowBalance",
  "bankAccount", "bankName"
) values (
  'mec-prof-001', 'usr-mec-001', '3171012345670001', 'SIM-3171-889900',
  'BNSP-IV-2021-0098', 'Bengkel Bambang Motor',
  -6.215, 106.832, true, 1485000, 165000,
  '1234567890', 'BCA'
)
on conflict (id) do nothing;

insert into public."Vehicle" (
  id, "userId", brand, model, year, "licensePlate", color, "isActive",
  "odometerKm", "healthPercent", "imageUrl", "lastServiceDate"
) values
  (
    'veh-001', 'usr-cst-001', 'Toyota', 'Avanza Veloz 1.5 AT', 2021,
    'B 1234 ABC', 'Silver Metalik', true, 34200, 94,
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    '2024-05-12'
  ),
  (
    'veh-002', 'usr-cst-001', 'Honda', 'Beat 110cc CBS', 2022,
    'B 5678 XYZ', 'Hitam Glossy', false, 14500, 88,
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    '2024-03-10'
  )
on conflict (id) do nothing;

insert into public."ServiceOrder" (
  id, "orderNumber", "customerId", "mechanicId", "vehicleId", "serviceType",
  status, "totalCost", "isEmergency", "isVIP", "pickupLat", "pickupLng",
  "pickupAddress", "itemsJson", "diagnosticNotes"
) values (
  'SRV-8942', 'SRV-8942', 'usr-cst-001', 'usr-mec-001', 'veh-001',
  'Servis Berkala & Tune Up', 'DISPATCHED', 349000, false, true,
  -6.2088, 106.8456,
  'Jl. Sudirman No. 42, RT 04 / RW 02, Menteng, Jakarta Pusat',
  '[
    {"name": "Jasa Tune Up & 32 Pengecekan", "price": 299000},
    {"name": "Oli Mesin Shell Helix Ultra 4L", "price": 50000},
    {"name": "Biaya Kunjungan Mekanik (PROMO)", "price": 0}
  ]'::jsonb,
  'Tarikan gas bawah agak berat saat mesin panas, tolong periksa celah busi dan filter udara.'
)
on conflict (id) do nothing;

insert into public."PremiumSubscription" (
  id, "userId", "planType", "warrantyDays", "endDate", "isActive"
) values (
  'sub-001', 'usr-cst-001', 'ANNUAL', 30, now() + interval '1 year', true
)
on conflict (id) do nothing;

insert into public."DisputeTicket" (
  id, "orderId", "customerId", "complaintText", status
) values (
  'DSP-1002', 'SRV-8942', 'usr-cst-001',
  'Setelah servis ganti van belt kemarin, ada bunyi dengung kecil saat rpm 2500. Garansi masih 28 hari aktif.',
  'OPEN'
)
on conflict (id) do nothing;
