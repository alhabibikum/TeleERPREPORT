import {
  Company,
  Branch,
  User,
  ProductCategory,
  Brand,
  Product,
  IMEIDevice,
  Customer,
  Supplier,
  Account,
  Sale,
  Purchase,
  Expense,
  Employee,
  AttendanceRecord,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  AlertNotification,
  ApprovalRequest,
  AuditLog,
  JournalEntry,
  StockTransfer,
  WarrantyCase,
  CustomerComplaint,
  Quotation,
  SalesReturn,
  BankReconciliationRecord,
  SMSNotificationLog,
  InstallmentAgreement,
  AIAnomalyRecord,
  AIAuditTrailEntry,
  VoiceFeedbackConfig,
  UserErrorProfile
} from '../types';

export const initialCompany: Company = {
  id: 'comp_1',
  name: 'SmartPhone Galaxy BD Ltd.',
  legal_name: 'SmartPhone Galaxy Bangladesh Private Limited',
  bin_number: '002948291-0101',
  vat_registration: 'BIN-19284719-2024',
  phone: '+880 1711-002233',
  email: 'info@smartphonegalaxybd.com',
  website: 'https://smartphonegalaxybd.com',
  address: 'Level 4, Sena Kalyan Bhaban, Motijheel C/A, Dhaka-1000, Bangladesh',
  currency: 'BDT',
  currency_symbol: '৳'
};

export const initialBranches: Branch[] = [
  {
    id: 'br_1',
    code: 'MOT-01',
    name: 'Motijheel Flagship Store',
    bn_name: 'মতিঝিল ফ্ল্যাগশিপ শোরুম',
    address: 'Shop 102, Ground Floor, Dilkusha C/A, Motijheel, Dhaka-1000',
    phone: '+880 1711-223344',
    manager_id: 'usr_3',
    manager_name: 'Tariqul Islam',
    cash_balance: 145000,
    opening_time: '10:00 AM',
    closing_time: '08:30 PM'
  },
  {
    id: 'br_2',
    code: 'BASH-02',
    name: 'Bashundhara City Mega Mall',
    bn_name: 'বসুন্ধরা সিটি মেগা মল ব্রাঞ্চ',
    address: 'Shop 5B-24, Level 5, Block B, Bashundhara City, Panthapath, Dhaka',
    phone: '+880 1819-334455',
    manager_id: 'usr_4',
    manager_name: 'Fahim Rahman',
    cash_balance: 218500,
    opening_time: '10:30 AM',
    closing_time: '09:00 PM'
  },
  {
    id: 'br_3',
    code: 'UTT-03',
    name: 'Uttara Sector-7 Hub',
    bn_name: 'উত্তরা সেক্টর-৭ হাব',
    address: 'House 14, Road 18, Sector 7, Jashimuddin Avenue, Uttara, Dhaka',
    phone: '+880 1912-445566',
    manager_id: 'usr_5',
    manager_name: 'Mahmudul Hasan',
    cash_balance: 92400,
    opening_time: '10:00 AM',
    closing_time: '08:30 PM'
  },
  {
    id: 'br_4',
    code: 'TEJ-WH',
    name: 'Tejgaon Central Depot (WH)',
    bn_name: 'তেজগাঁও কেন্দ্রীয় ওয়্যারহাউজ',
    address: 'Plot 45/A, Tejgaon Industrial Area, Dhaka-1208',
    phone: '+880 1713-998877',
    manager_id: 'usr_8',
    manager_name: 'Shakil Ahmed',
    cash_balance: 50000,
    is_warehouse: true,
    opening_time: '09:00 AM',
    closing_time: '06:00 PM'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Al-Amin Chowdhury',
    email: 'owner@galaxybd.com',
    phone: '+880 1711-000111',
    role: 'owner',
    active: true,
    permissions: [
      'view',
      'create',
      'edit',
      'delete',
      'approve',
      'post',
      'print',
      'export',
      'close_period',
      'manage_users',
      'manage_settings'
    ]
  },
  {
    id: 'usr_2',
    name: 'Kamrul Hasan',
    email: 'gm@galaxybd.com',
    phone: '+880 1711-000222',
    role: 'general_manager',
    active: true,
    permissions: [
      'view',
      'create',
      'edit',
      'delete',
      'approve',
      'post',
      'print',
      'export',
      'close_period',
      'manage_users'
    ]
  },
  {
    id: 'usr_3',
    name: 'Tariqul Islam',
    email: 'motijheel.mgr@galaxybd.com',
    phone: '+880 1711-223344',
    role: 'branch_manager',
    branch_id: 'br_1',
    active: true,
    permissions: ['view', 'create', 'edit', 'approve', 'post', 'print', 'export']
  },
  {
    id: 'usr_4',
    name: 'Fahim Rahman',
    email: 'bashundhara.mgr@galaxybd.com',
    phone: '+880 1819-334455',
    role: 'branch_manager',
    branch_id: 'br_2',
    active: true,
    permissions: ['view', 'create', 'edit', 'approve', 'post', 'print', 'export']
  },
  {
    id: 'usr_5',
    name: 'Mahmudul Hasan',
    email: 'uttara.mgr@galaxybd.com',
    phone: '+880 1912-445566',
    role: 'branch_manager',
    branch_id: 'br_3',
    active: true,
    permissions: ['view', 'create', 'edit', 'approve', 'post', 'print', 'export']
  },
  {
    id: 'usr_6',
    name: 'Nasir Uddin, FCMA',
    email: 'accounts@galaxybd.com',
    phone: '+880 1712-334455',
    role: 'accountant',
    active: true,
    permissions: ['view', 'create', 'edit', 'approve', 'post', 'print', 'export', 'close_period']
  },
  {
    id: 'usr_7',
    name: 'Mehedi Hasan',
    email: 'mehedi.sales@galaxybd.com',
    phone: '+880 1611-224466',
    role: 'cashier',
    branch_id: 'br_1',
    active: true,
    permissions: ['view', 'create', 'post', 'print']
  },
  {
    id: 'usr_8',
    name: 'Shakil Ahmed',
    email: 'warehouse@galaxybd.com',
    phone: '+880 1713-998877',
    role: 'warehouse_manager',
    branch_id: 'br_4',
    active: true,
    permissions: ['view', 'create', 'edit', 'approve', 'print', 'export']
  }
];

export const initialCategories: ProductCategory[] = [
  { id: 'cat_1', name: 'Flagship Smartphones', code: 'SMART-FLAG', description: 'Premium tier high-end smartphones', has_imei: true },
  { id: 'cat_2', name: 'Mid-Range Smartphones', code: 'SMART-MID', description: 'Budget and balanced daily driver devices', has_imei: true },
  { id: 'cat_3', name: 'Feature Phones', code: 'FEAT-PHN', description: 'Basic keypad mobile phones', has_imei: true },
  { id: 'cat_4', name: 'Tablets & iPads', code: 'TAB-IPAD', description: 'Tablets and cellular pads', has_imei: true },
  { id: 'cat_5', name: 'Chargers & Power Adapters', code: 'ACC-CHG', description: 'Fast chargers and wall bricks', has_imei: false },
  { id: 'cat_6', name: 'Cables & Interconnects', code: 'ACC-CBL', description: 'Type-C, Lightning and braided cords', has_imei: false },
  { id: 'cat_7', name: 'TWS Earbuds & Audio', code: 'ACC-AUD', description: 'Wireless earbuds and noise cancelling headsets', has_imei: false },
  { id: 'cat_8', name: 'Power Banks', code: 'ACC-PWR', description: 'Portable power battery bricks', has_imei: false },
  { id: 'cat_9', name: 'Cases & Screen Protectors', code: 'ACC-CAS', description: 'Armor cases and UV tempered glasses', has_imei: false },
  { id: 'cat_10', name: 'Smart Watches', code: 'ACC-WTC', description: 'Fitness bands and wearables', has_imei: true }
];

export const initialBrands: Brand[] = [
  { id: 'brd_1', name: 'Samsung', origin_country: 'South Korea' },
  { id: 'brd_2', name: 'Apple', origin_country: 'USA' },
  { id: 'brd_3', name: 'Xiaomi', origin_country: 'China' },
  { id: 'brd_4', name: 'Vivo', origin_country: 'China' },
  { id: 'brd_5', name: 'Realme', origin_country: 'China' },
  { id: 'brd_6', name: 'Infinix', origin_country: 'Hong Kong' },
  { id: 'brd_7', name: 'Anker', origin_country: 'USA' },
  { id: 'brd_8', name: 'Baseus', origin_country: 'China' },
  { id: 'brd_9', name: 'Symphony', origin_country: 'Bangladesh' },
  { id: 'brd_10', name: 'Walton', origin_country: 'Bangladesh' }
];

export const initialProducts: Product[] = [
  {
    id: 'prd_1',
    code: 'SAM-S24U-512',
    name: 'Samsung Galaxy S24 Ultra 5G',
    brand_id: 'brd_1',
    brand_name: 'Samsung',
    category_id: 'cat_1',
    category_name: 'Flagship Smartphones',
    has_imei: true,
    model: 'Galaxy S24 Ultra',
    color: 'Titanium Gray',
    storage: '512GB',
    ram: '12GB',
    barcode: '8806095311234',
    cost_price: 168000,
    selling_price: 189999,
    mrp: 195000,
    min_stock_level: 3,
    warranty_months: 12
  },
  {
    id: 'prd_2',
    code: 'APL-16PM-256',
    name: 'Apple iPhone 16 Pro Max',
    brand_id: 'brd_2',
    brand_name: 'Apple',
    category_id: 'cat_1',
    category_name: 'Flagship Smartphones',
    has_imei: true,
    model: 'iPhone 16 Pro Max',
    color: 'Desert Titanium',
    storage: '256GB',
    ram: '8GB',
    barcode: '195949112233',
    cost_price: 182000,
    selling_price: 204999,
    mrp: 209000,
    min_stock_level: 2,
    warranty_months: 12
  },
  {
    id: 'prd_3',
    code: 'APL-16P-128',
    name: 'Apple iPhone 16 Pro',
    brand_id: 'brd_2',
    brand_name: 'Apple',
    category_id: 'cat_1',
    category_name: 'Flagship Smartphones',
    has_imei: true,
    model: 'iPhone 16 Pro',
    color: 'Natural Titanium',
    storage: '128GB',
    ram: '8GB',
    barcode: '195949223344',
    cost_price: 154000,
    selling_price: 172999,
    mrp: 178000,
    min_stock_level: 3,
    warranty_months: 12
  },
  {
    id: 'prd_4',
    code: 'XIA-RN13P-256',
    name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand_id: 'brd_3',
    brand_name: 'Xiaomi',
    category_id: 'cat_2',
    category_name: 'Mid-Range Smartphones',
    has_imei: true,
    model: 'Redmi Note 13 Pro+',
    color: 'Midnight Black',
    storage: '256GB',
    ram: '12GB',
    barcode: '6941812741123',
    cost_price: 36500,
    selling_price: 41999,
    mrp: 43000,
    min_stock_level: 5,
    warranty_months: 12
  },
  {
    id: 'prd_5',
    code: 'XIA-RN13-128',
    name: 'Xiaomi Redmi Note 13 4G',
    brand_id: 'brd_3',
    brand_name: 'Xiaomi',
    category_id: 'cat_2',
    category_name: 'Mid-Range Smartphones',
    has_imei: true,
    model: 'Redmi Note 13',
    color: 'Mint Green',
    storage: '128GB',
    ram: '6GB',
    barcode: '6941812749988',
    cost_price: 18200,
    selling_price: 21499,
    mrp: 22500,
    min_stock_level: 6,
    warranty_months: 12
  },
  {
    id: 'prd_6',
    code: 'VIV-V30-256',
    name: 'Vivo V30 5G',
    brand_id: 'brd_4',
    brand_name: 'Vivo',
    category_id: 'cat_2',
    category_name: 'Mid-Range Smartphones',
    has_imei: true,
    model: 'Vivo V30 5G',
    color: 'Peacock Green',
    storage: '256GB',
    ram: '12GB',
    barcode: '6935117823412',
    cost_price: 48000,
    selling_price: 54999,
    mrp: 56999,
    min_stock_level: 4,
    warranty_months: 12
  },
  {
    id: 'prd_7',
    code: 'RLM-12P-256',
    name: 'Realme 12 Pro+ 5G',
    brand_id: 'brd_5',
    brand_name: 'Realme',
    category_id: 'cat_2',
    category_name: 'Mid-Range Smartphones',
    has_imei: true,
    model: 'Realme 12 Pro+',
    color: 'Submarine Blue',
    storage: '256GB',
    ram: '8GB',
    barcode: '6941399061122',
    cost_price: 43000,
    selling_price: 49999,
    mrp: 51999,
    min_stock_level: 3,
    warranty_months: 12
  },
  {
    id: 'prd_8',
    code: 'SYM-D45',
    name: 'Symphony D45 Dual SIM',
    brand_id: 'brd_9',
    brand_name: 'Symphony',
    category_id: 'cat_3',
    category_name: 'Feature Phones',
    has_imei: true,
    model: 'D45',
    color: 'Dark Blue',
    storage: '32MB',
    ram: '32MB',
    barcode: '894101112233',
    cost_price: 1100,
    selling_price: 1450,
    mrp: 1490,
    min_stock_level: 10,
    warranty_months: 12
  },
  {
    id: 'prd_9',
    code: 'ANK-313-CHG',
    name: 'Anker 511 Charger (Nano Pro 20W)',
    brand_id: 'brd_7',
    brand_name: 'Anker',
    category_id: 'cat_5',
    category_name: 'Chargers & Power Adapters',
    has_imei: false,
    model: 'Nano Pro 20W',
    barcode: '194644021234',
    cost_price: 1150,
    selling_price: 1750,
    mrp: 1850,
    min_stock_level: 15,
    warranty_months: 18
  },
  {
    id: 'prd_10',
    code: 'SAM-25W-ADP',
    name: 'Samsung 25W Type-C Super Fast Adapter',
    brand_id: 'brd_1',
    brand_name: 'Samsung',
    category_id: 'cat_5',
    category_name: 'Chargers & Power Adapters',
    has_imei: false,
    model: 'EP-TA800',
    barcode: '8806090123456',
    cost_price: 1200,
    selling_price: 1850,
    mrp: 1999,
    min_stock_level: 12,
    warranty_months: 6
  },
  {
    id: 'prd_11',
    code: 'BAS-100W-CBL',
    name: 'Baseus 100W Fast Charging Type-C to Type-C (2M)',
    brand_id: 'brd_8',
    brand_name: 'Baseus',
    category_id: 'cat_6',
    category_name: 'Cables & Interconnects',
    has_imei: false,
    model: 'Cafule 100W',
    barcode: '6953156281923',
    cost_price: 480,
    selling_price: 850,
    mrp: 950,
    min_stock_level: 20,
    warranty_months: 6
  },
  {
    id: 'prd_12',
    code: 'BAS-BOWIE-M2',
    name: 'Baseus Bowie M2+ ANC True Wireless Earbuds',
    brand_id: 'brd_8',
    brand_name: 'Baseus',
    category_id: 'cat_7',
    category_name: 'TWS Earbuds & Audio',
    has_imei: false,
    model: 'Bowie M2+',
    barcode: '6953156299112',
    cost_price: 2450,
    selling_price: 3650,
    mrp: 3899,
    min_stock_level: 8,
    warranty_months: 6
  },
  {
    id: 'prd_13',
    code: 'ANK-PWR-20K',
    name: 'Anker 325 Power Bank 20000mAh PowerCore',
    brand_id: 'brd_7',
    brand_name: 'Anker',
    category_id: 'cat_8',
    category_name: 'Power Banks',
    has_imei: false,
    model: 'PowerCore 20K',
    barcode: '194644078901',
    cost_price: 2750,
    selling_price: 3850,
    mrp: 4100,
    min_stock_level: 10,
    warranty_months: 18
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    code: 'CUST-001',
    name: 'Rahim Telecom & Electronics',
    phone: '01712-334455',
    email: 'rahimtelecom@gmail.com',
    address: 'Shop 14, Baitul Mukarram Market, Motijheel, Dhaka',
    credit_limit: 250000,
    current_balance: 75000,
    opening_balance: 30000,
    branch_id: 'br_1',
    created_at: '2026-08-01'
  },
  {
    id: 'cust_2',
    code: 'CUST-002',
    name: 'Anik Enterprise',
    phone: '01819-445566',
    email: 'anikenterprise.bd@gmail.com',
    address: 'Plot 12, Gulshan-1 Circle, Dhaka',
    credit_limit: 400000,
    current_balance: 142000,
    opening_balance: 50000,
    branch_id: 'br_2',
    created_at: '2026-08-05'
  },
  {
    id: 'cust_3',
    code: 'CUST-003',
    name: 'Sadia Gadget World',
    phone: '01911-556677',
    email: 'sadiagadgets@yahoo.com',
    address: 'Sector 3 Commercial Zone, Uttara, Dhaka',
    credit_limit: 150000,
    current_balance: 28500,
    opening_balance: 0,
    branch_id: 'br_3',
    created_at: '2026-08-10'
  },
  {
    id: 'cust_4',
    code: 'CUST-004',
    name: 'Tanvir Hossain (Walk-in VIP)',
    phone: '01715-667788',
    email: 'tanvir.hossain@bankerbd.com',
    address: 'Dhanmondi Road 27, Dhaka',
    credit_limit: 50000,
    current_balance: 0,
    opening_balance: 0,
    branch_id: 'br_1',
    created_at: '2026-09-01'
  },
  {
    id: 'cust_5',
    code: 'CUST-005',
    name: 'Chowdhury Mobile Palace',
    phone: '01611-778899',
    email: 'chowdhurymobile@gmail.com',
    address: 'New Super Market, Level 2, Mirpur 1, Dhaka',
    credit_limit: 300000,
    current_balance: 185000,
    opening_balance: 90000,
    branch_id: 'br_1',
    created_at: '2026-07-15'
  },
  {
    id: 'cust_6',
    code: 'CUST-006',
    name: 'Walk-in Retail Customer',
    phone: '01700-000000',
    address: 'Counter Cash Walk-in',
    credit_limit: 0,
    current_balance: 0,
    opening_balance: 0,
    branch_id: 'br_1',
    created_at: '2026-01-01'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    code: 'SUP-001',
    name: 'Fair Electronics Ltd. (Samsung Official)',
    contact_person: 'Md. Zulfikar Ali (National Sales Mgr)',
    phone: '01711-998811',
    email: 'orders@fairelectronics.com.bd',
    address: 'Gulshan 2, Dhaka-1212',
    opening_payable: 450000,
    current_payable: 320000,
    created_at: '2026-01-10'
  },
  {
    id: 'sup_2',
    code: 'SUP-002',
    name: 'Apex Telecom & Distribution (Apple Line)',
    contact_person: 'Rezwanul Karim',
    phone: '01819-887722',
    email: 'distribution@apextelecom.com',
    address: 'Banani C/A, Road 11, Dhaka',
    opening_payable: 780000,
    current_payable: 540000,
    created_at: '2026-01-15'
  },
  {
    id: 'sup_3',
    code: 'SUP-003',
    name: 'Solar Electronics (Xiaomi National)',
    contact_person: 'Tanmoy Debnath',
    phone: '01912-776633',
    email: 'sales@solarelectronicsbd.com',
    address: 'Bijoy Nagar, Kakrail, Dhaka',
    opening_payable: 320000,
    current_payable: 195000,
    created_at: '2026-02-01'
  },
  {
    id: 'sup_4',
    code: 'SUP-004',
    name: 'Smart Technologies BD Ltd. (Accessories)',
    contact_person: 'Mahbubur Rahman',
    phone: '01713-665544',
    email: 'anker.baseus@smart-bd.com',
    address: 'Jahir Smart Tower, Agargaon, Dhaka',
    opening_payable: 95000,
    current_payable: 42000,
    created_at: '2026-02-15'
  }
];

export const initialAccounts: Account[] = [
  // Assets
  { id: 'acc_1010', code: '1010', name: 'Cash in Hand - Motijheel', bn_name: 'নগদ তহবিল - মতিঝিল', type: 'asset', category: 'Cash', balance: 145000, is_active: true },
  { id: 'acc_1011', code: '1011', name: 'Cash in Hand - Bashundhara', bn_name: 'নগদ তহবিল - বসুন্ধরা', type: 'asset', category: 'Cash', balance: 218500, is_active: true },
  { id: 'acc_1012', code: '1012', name: 'Cash in Hand - Uttara', bn_name: 'নগদ তহবিল - উত্তরা', type: 'asset', category: 'Cash', balance: 92400, is_active: true },
  { id: 'acc_1020', code: '1020', name: 'City Bank Ltd. Current A/C (11029384)', bn_name: 'সিটি ব্যাংক হিসাব', type: 'asset', category: 'Bank', balance: 1450000, is_active: true },
  { id: 'acc_1021', code: '1021', name: 'BRAC Bank Ltd. Corporate A/C (15092019)', bn_name: 'ব্র্যাক ব্যাংক হিসাব', type: 'asset', category: 'Bank', balance: 885000, is_active: true },
  { id: 'acc_1030', code: '1030', name: 'bKash Merchant Account (01711002233)', bn_name: 'বিকাশ মার্চেন্ট হিসাব', type: 'asset', category: 'MFS', balance: 345000, is_active: true },
  { id: 'acc_1031', code: '1031', name: 'Nagad Merchant Account (01819334455)', bn_name: 'নগদ মার্চেন্ট হিসাব', type: 'asset', category: 'MFS', balance: 215000, is_active: true },
  { id: 'acc_1032', code: '1032', name: 'Rocket Merchant Account (01912445566)', bn_name: 'রকেট মার্চেন্ট হিসাব', type: 'asset', category: 'MFS', balance: 82000, is_active: true },
  { id: 'acc_1100', code: '1100', name: 'Accounts Receivable (Customer Ledger)', bn_name: 'গ্রাহক দেনাদার হিসাব', type: 'asset', category: 'Receivables', balance: 430500, is_active: true },
  { id: 'acc_1200', code: '1200', name: 'Inventory Asset - Mobile Phones', bn_name: 'মজুদ পণ্য - মোবাইল সেট', type: 'asset', category: 'Inventory', balance: 6480000, is_active: true },
  { id: 'acc_1210', code: '1210', name: 'Inventory Asset - Accessories', bn_name: 'মজুদ পণ্য - এক্সেসরিজ', type: 'asset', category: 'Inventory', balance: 840000, is_active: true },
  
  // Liabilities
  { id: 'acc_2010', code: '2010', name: 'Accounts Payable (Supplier Ledger)', bn_name: 'সরবরাহকারী পাওনাদার হিসাব', type: 'liability', category: 'Payables', balance: 1097000, is_active: true },
  { id: 'acc_2020', code: '2020', name: 'VAT / Tax Payable (NBR 5% / 7.5%)', bn_name: 'ভ্যাট প্রদেয় হিসাব', type: 'liability', category: 'Tax', balance: 64200, is_active: true },
  { id: 'acc_2030', code: '2030', name: 'Accrued Operating Expenses', bn_name: 'বকেয়া খরচ সমূহ', type: 'liability', category: 'Accruals', balance: 45000, is_active: true },
  
  // Equity
  { id: 'acc_3010', code: '3010', name: "Owner's Paid-up Capital", bn_name: 'মালিকানা মূলধন', type: 'equity', category: 'Equity', balance: 8000000, is_active: true },
  { id: 'acc_3020', code: '3020', name: 'Retained Earnings', bn_name: 'পুঞ্জীভূত মুনাফা', type: 'equity', category: 'Equity', balance: 1689200, is_active: true },
  
  // Revenue
  { id: 'acc_4010', code: '4010', name: 'Mobile Phone Sales Revenue', bn_name: 'মোবাইল বিক্রয় আয়', type: 'revenue', category: 'Sales', balance: 2450000, is_active: true },
  { id: 'acc_4020', code: '4020', name: 'Accessories Sales Revenue', bn_name: 'এক্সেসরিজ বিক্রয় আয়', type: 'revenue', category: 'Sales', balance: 395000, is_active: true },
  { id: 'acc_4030', code: '4030', name: 'Service & Warranty Handling Income', bn_name: 'সার্ভিস চার্জ আয়', type: 'revenue', category: 'Services', balance: 28500, is_active: true },
  
  // COGS
  { id: 'acc_5010', code: '5010', name: 'Cost of Goods Sold - Mobile Phones', bn_name: 'বিক্রিত পণ্যের ব্যয় - মোবাইল', type: 'cogs', category: 'Cost of Sales', balance: 2160000, is_active: true },
  { id: 'acc_5020', code: '5020', name: 'Cost of Goods Sold - Accessories', bn_name: 'বিক্রিত পণ্যের ব্যয় - এক্সেসরিজ', type: 'cogs', category: 'Cost of Sales', balance: 228000, is_active: true },
  
  // Expenses
  { id: 'acc_6010', code: '6010', name: 'Showroom & Warehouse Rent', bn_name: 'দোকান ও গুদাম ভাড়া', type: 'expense', category: 'Operations', balance: 240000, is_active: true },
  { id: 'acc_6020', code: '6020', name: 'Staff Salaries & Allowances', bn_name: 'কর্মচারীদের বেতন-ভাতা', type: 'expense', category: 'Payroll', balance: 265000, is_active: true },
  { id: 'acc_6030', code: '6030', name: 'Electricity, Generator & Utilities', bn_name: 'বিদ্যুৎ ও ইউটিলিটি বিল', type: 'expense', category: 'Utilities', balance: 38400, is_active: true },
  { id: 'acc_6040', code: '6040', name: 'Internet, ERP Software & Cloud Hosting', bn_name: 'ইন্টারনেট ও সফটওয়্যার খরচ', type: 'expense', category: 'IT', balance: 18500, is_active: true },
  { id: 'acc_6050', code: '6050', name: 'Transport, Delivery & Courier Charges', bn_name: 'পরিবহন ও কুরিয়ার খরচ', type: 'expense', category: 'Logistics', balance: 14200, is_active: true },
  { id: 'acc_6060', code: '6060', name: 'Marketing, Social Media & Promotion', bn_name: 'বিজ্ঞাপন ও বিপণন ব্যয়', type: 'expense', category: 'Marketing', balance: 45000, is_active: true },
  { id: 'acc_6070', code: '6070', name: 'Office Maintenance & Tea/Snacks', bn_name: 'আপ্যায়ন ও রক্ষণাবেক্ষণ', type: 'expense', category: 'General', balance: 12800, is_active: true }
];

// Pre-seeded IMEIs
export const initialIMEIs: IMEIDevice[] = [
  // Samsung S24 Ultra
  {
    id: 'imei_101',
    imei1: '358249110294821',
    imei2: '358249110294822',
    serial_number: 'R58N10298A',
    product_id: 'prd_1',
    product_name: 'Samsung Galaxy S24 Ultra 5G',
    brand_name: 'Samsung',
    model: 'Galaxy S24 Ultra',
    color: 'Titanium Gray',
    storage: '512GB',
    ram: '12GB',
    cost_price: 168000,
    selling_price: 189999,
    supplier_id: 'sup_1',
    supplier_name: 'Fair Electronics Ltd. (Samsung Official)',
    purchase_invoice_id: 'PUR-2026-001',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Display Shelf A1',
    status: 'in_stock',
    created_at: '2026-09-15'
  },
  {
    id: 'imei_102',
    imei1: '358249110294823',
    imei2: '358249110294824',
    serial_number: 'R58N10299B',
    product_id: 'prd_1',
    product_name: 'Samsung Galaxy S24 Ultra 5G',
    brand_name: 'Samsung',
    model: 'Galaxy S24 Ultra',
    color: 'Titanium Gray',
    storage: '512GB',
    ram: '12GB',
    cost_price: 168000,
    selling_price: 189999,
    supplier_id: 'sup_1',
    supplier_name: 'Fair Electronics Ltd. (Samsung Official)',
    purchase_invoice_id: 'PUR-2026-001',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    current_location: 'Safe Cabinet B',
    status: 'in_stock',
    created_at: '2026-09-15'
  },
  {
    id: 'imei_103',
    imei1: '358249110294825',
    imei2: '358249110294826',
    serial_number: 'R58N10300C',
    product_id: 'prd_1',
    product_name: 'Samsung Galaxy S24 Ultra 5G',
    brand_name: 'Samsung',
    model: 'Galaxy S24 Ultra',
    color: 'Titanium Gray',
    storage: '512GB',
    ram: '12GB',
    cost_price: 168000,
    selling_price: 189999,
    supplier_id: 'sup_1',
    supplier_name: 'Fair Electronics Ltd. (Samsung Official)',
    purchase_invoice_id: 'PUR-2026-001',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Delivered',
    status: 'sold',
    sold_at: '2026-10-06T14:30:00',
    sale_invoice_id: 'INV-2026-089',
    customer_id: 'cust_4',
    customer_name: 'Tanvir Hossain (Walk-in VIP)',
    warranty_expire_date: '2027-10-06',
    created_at: '2026-09-15'
  },
  // Apple iPhone 16 Pro Max
  {
    id: 'imei_201',
    imei1: '356984129481920',
    imei2: '356984129481921',
    serial_number: 'F2LL8983PL',
    product_id: 'prd_2',
    product_name: 'Apple iPhone 16 Pro Max',
    brand_name: 'Apple',
    model: 'iPhone 16 Pro Max',
    color: 'Desert Titanium',
    storage: '256GB',
    ram: '8GB',
    cost_price: 182000,
    selling_price: 204999,
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    purchase_invoice_id: 'PUR-2026-002',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    current_location: 'Premium Glass Vault',
    status: 'in_stock',
    created_at: '2026-09-20'
  },
  {
    id: 'imei_202',
    imei1: '356984129481922',
    imei2: '356984129481923',
    serial_number: 'F2LL8984PM',
    product_id: 'prd_2',
    product_name: 'Apple iPhone 16 Pro Max',
    brand_name: 'Apple',
    model: 'iPhone 16 Pro Max',
    color: 'Desert Titanium',
    storage: '256GB',
    ram: '8GB',
    cost_price: 182000,
    selling_price: 204999,
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    purchase_invoice_id: 'PUR-2026-002',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    current_location: 'Display Counter',
    status: 'in_stock',
    created_at: '2026-09-20'
  },
  {
    id: 'imei_203',
    imei1: '356984129481924',
    imei2: '356984129481925',
    serial_number: 'F2LL8985PN',
    product_id: 'prd_2',
    product_name: 'Apple iPhone 16 Pro Max',
    brand_name: 'Apple',
    model: 'iPhone 16 Pro Max',
    color: 'Desert Titanium',
    storage: '256GB',
    ram: '8GB',
    cost_price: 182000,
    selling_price: 204999,
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    purchase_invoice_id: 'PUR-2026-002',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Central Vault',
    status: 'in_stock',
    created_at: '2026-09-20'
  },
  // Apple iPhone 16 Pro
  {
    id: 'imei_301',
    imei1: '359102948192001',
    imei2: '359102948192002',
    serial_number: 'G7MK9901QA',
    product_id: 'prd_3',
    product_name: 'Apple iPhone 16 Pro',
    brand_name: 'Apple',
    model: 'iPhone 16 Pro',
    color: 'Natural Titanium',
    storage: '128GB',
    ram: '8GB',
    cost_price: 154000,
    selling_price: 172999,
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    purchase_invoice_id: 'PUR-2026-002',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Shelf 2',
    status: 'in_stock',
    created_at: '2026-09-22'
  },
  {
    id: 'imei_302',
    imei1: '359102948192003',
    imei2: '359102948192004',
    serial_number: 'G7MK9902QB',
    product_id: 'prd_3',
    product_name: 'Apple iPhone 16 Pro',
    brand_name: 'Apple',
    model: 'iPhone 16 Pro',
    color: 'Natural Titanium',
    storage: '128GB',
    ram: '8GB',
    cost_price: 154000,
    selling_price: 172999,
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    purchase_invoice_id: 'PUR-2026-002',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    current_location: 'Customer Returned - Tech Inspection',
    status: 'warranty',
    created_at: '2026-09-22'
  },
  // Xiaomi Redmi Note 13 Pro+
  {
    id: 'imei_401',
    imei1: '869201948102931',
    imei2: '869201948102932',
    serial_number: 'XIA13P091A',
    product_id: 'prd_4',
    product_name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand_name: 'Xiaomi',
    model: 'Redmi Note 13 Pro+',
    color: 'Midnight Black',
    storage: '256GB',
    ram: '12GB',
    cost_price: 36500,
    selling_price: 41999,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-003',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Counter Showcase 3',
    status: 'in_stock',
    created_at: '2026-09-25'
  },
  {
    id: 'imei_402',
    imei1: '869201948102933',
    imei2: '869201948102934',
    serial_number: 'XIA13P092B',
    product_id: 'prd_4',
    product_name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand_name: 'Xiaomi',
    model: 'Redmi Note 13 Pro+',
    color: 'Midnight Black',
    storage: '256GB',
    ram: '12GB',
    cost_price: 36500,
    selling_price: 41999,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-003',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    current_location: 'Showcase 1',
    status: 'in_stock',
    created_at: '2026-09-25'
  },
  {
    id: 'imei_403',
    imei1: '869201948102935',
    imei2: '869201948102936',
    serial_number: 'XIA13P093C',
    product_id: 'prd_4',
    product_name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand_name: 'Xiaomi',
    model: 'Redmi Note 13 Pro+',
    color: 'Midnight Black',
    storage: '256GB',
    ram: '12GB',
    cost_price: 36500,
    selling_price: 41999,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-003',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    current_location: 'Display 4',
    status: 'in_stock',
    created_at: '2026-09-25'
  },
  // Vivo V30 5G
  {
    id: 'imei_501',
    imei1: '861029384756191',
    imei2: '861029384756192',
    serial_number: 'VIV30P111A',
    product_id: 'prd_6',
    product_name: 'Vivo V30 5G',
    brand_name: 'Vivo',
    model: 'Vivo V30 5G',
    color: 'Peacock Green',
    storage: '256GB',
    ram: '12GB',
    cost_price: 48000,
    selling_price: 54999,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-004',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Vivo Brand Corner',
    status: 'in_stock',
    created_at: '2026-09-28'
  },
  {
    id: 'imei_502',
    imei1: '861029384756193',
    imei2: '861029384756194',
    serial_number: 'VIV30P112B',
    product_id: 'prd_6',
    product_name: 'Vivo V30 5G',
    brand_name: 'Vivo',
    model: 'Vivo V30 5G',
    color: 'Peacock Green',
    storage: '256GB',
    ram: '12GB',
    cost_price: 48000,
    selling_price: 54999,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-004',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    current_location: 'Corner Counter',
    status: 'in_stock',
    created_at: '2026-09-28'
  },
  // Symphony D45 Feature Phone
  {
    id: 'imei_601',
    imei1: '351928374650191',
    imei2: '351928374650192',
    serial_number: 'SYMD45001A',
    product_id: 'prd_8',
    product_name: 'Symphony D45 Dual SIM',
    brand_name: 'Symphony',
    model: 'D45',
    color: 'Dark Blue',
    storage: '32MB',
    ram: '32MB',
    cost_price: 1100,
    selling_price: 1450,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-005',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    current_location: 'Feature Phone Box',
    status: 'in_stock',
    created_at: '2026-10-01'
  },
  {
    id: 'imei_602',
    imei1: '351928374650193',
    imei2: '351928374650194',
    serial_number: 'SYMD45002B',
    product_id: 'prd_8',
    product_name: 'Symphony D45 Dual SIM',
    brand_name: 'Symphony',
    model: 'D45',
    color: 'Dark Blue',
    storage: '32MB',
    ram: '32MB',
    cost_price: 1100,
    selling_price: 1450,
    supplier_id: 'sup_3',
    supplier_name: 'Solar Electronics (Xiaomi National)',
    purchase_invoice_id: 'PUR-2026-005',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    current_location: 'Box Bin 4',
    status: 'in_stock',
    created_at: '2026-10-01'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale_1',
    invoice_no: 'INV-2026-089',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    customer_id: 'cust_4',
    customer_name: 'Tanvir Hossain (Walk-in VIP)',
    customer_phone: '01715-667788',
    items: [
      {
        id: 'sitem_1',
        product_id: 'prd_1',
        product_name: 'Samsung Galaxy S24 Ultra 5G',
        model: 'Galaxy S24 Ultra',
        has_imei: true,
        imei_id: 'imei_103',
        imei1: '358249110294825',
        imei2: '358249110294826',
        quantity: 1,
        unit_price: 189999,
        cost_price: 168000,
        discount: 2000,
        subtotal: 187999,
        warranty_months: 12
      },
      {
        id: 'sitem_2',
        product_id: 'prd_10',
        product_name: 'Samsung 25W Type-C Super Fast Adapter',
        model: 'EP-TA800',
        has_imei: false,
        quantity: 1,
        unit_price: 1850,
        cost_price: 1200,
        discount: 100,
        subtotal: 1750,
        warranty_months: 6
      }
    ],
    subtotal: 189749,
    discount: 2100,
    vat_amount: 0,
    total_amount: 189749,
    paid_amount: 189749,
    due_amount: 0,
    payment_method: 'split',
    splits: [
      { method: 'cash', amount: 50000 },
      { method: 'bkash', amount: 89749, reference: 'TRX9A0192K' },
      { method: 'bank', amount: 50000, reference: 'City Bank Card 4912' }
    ],
    status: 'posted',
    sales_rep_id: 'usr_7',
    sales_rep_name: 'Mehedi Hasan',
    journal_entry_id: 'JRN-2026-101',
    notes: 'Walk-in flagship VIP customer. Full payment received on spot.',
    created_at: '2026-10-06T14:30:00'
  },
  {
    id: 'sale_2',
    invoice_no: 'INV-2026-090',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    customer_id: 'cust_2',
    customer_name: 'Anik Enterprise',
    customer_phone: '01819-445566',
    items: [
      {
        id: 'sitem_3',
        product_id: 'prd_4',
        product_name: 'Xiaomi Redmi Note 13 Pro+ 5G',
        model: 'Redmi Note 13 Pro+',
        has_imei: true,
        imei1: '869201948102999',
        quantity: 2,
        unit_price: 41999,
        cost_price: 36500,
        discount: 1000,
        subtotal: 82998,
        warranty_months: 12
      },
      {
        id: 'sitem_4',
        product_id: 'prd_9',
        product_name: 'Anker 511 Charger (Nano Pro 20W)',
        model: 'Nano Pro 20W',
        has_imei: false,
        quantity: 4,
        unit_price: 1750,
        cost_price: 1150,
        discount: 200,
        subtotal: 6800,
        warranty_months: 18
      }
    ],
    subtotal: 89798,
    discount: 1200,
    vat_amount: 0,
    total_amount: 89798,
    paid_amount: 40000,
    due_amount: 49798,
    payment_method: 'split',
    splits: [
      { method: 'bank', amount: 40000, reference: 'BRAC Cheque 90123' },
      { method: 'credit', amount: 49798 }
    ],
    status: 'posted',
    sales_rep_id: 'usr_4',
    sales_rep_name: 'Fahim Rahman',
    journal_entry_id: 'JRN-2026-102',
    notes: 'Credit sale to Anik Enterprise with 40k advance cheque.',
    created_at: '2026-10-07T11:15:00'
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur_1',
    purchase_no: 'PUR-2026-001',
    bill_no: 'FAIR-INV-8910',
    supplier_id: 'sup_1',
    supplier_name: 'Fair Electronics Ltd. (Samsung Official)',
    branch_id: 'br_4',
    branch_name: 'Tejgaon Central Depot (WH)',
    items: [
      {
        id: 'pitem_1',
        product_id: 'prd_1',
        product_name: 'Samsung Galaxy S24 Ultra 5G',
        model: 'Galaxy S24 Ultra',
        quantity: 5,
        unit_cost: 168000,
        subtotal: 840000
      }
    ],
    total_cost: 840000,
    paid_amount: 500000,
    due_amount: 340000,
    payment_method: 'split',
    splits: [
      { method: 'bank', amount: 500000, reference: 'City Bank RTGS #88192' },
      { method: 'credit', amount: 340000 }
    ],
    status: 'received',
    journal_entry_id: 'JRN-2026-080',
    received_date: '2026-09-15',
    created_at: '2026-09-15T10:00:00'
  },
  {
    id: 'pur_2',
    purchase_no: 'PUR-2026-002',
    bill_no: 'APEX-BILL-4412',
    supplier_id: 'sup_2',
    supplier_name: 'Apex Telecom & Distribution (Apple Line)',
    branch_id: 'br_4',
    branch_name: 'Tejgaon Central Depot (WH)',
    items: [
      {
        id: 'pitem_2',
        product_id: 'prd_2',
        product_name: 'Apple iPhone 16 Pro Max',
        model: 'iPhone 16 Pro Max',
        quantity: 4,
        unit_cost: 182000,
        subtotal: 728000
      },
      {
        id: 'pitem_3',
        product_id: 'prd_3',
        product_name: 'Apple iPhone 16 Pro',
        model: 'iPhone 16 Pro',
        quantity: 3,
        unit_cost: 154000,
        subtotal: 462000
      }
    ],
    total_cost: 1190000,
    paid_amount: 700000,
    due_amount: 490000,
    payment_method: 'bank',
    status: 'received',
    journal_entry_id: 'JRN-2026-081',
    received_date: '2026-09-20',
    created_at: '2026-09-20T11:30:00'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    voucher_no: 'EXP-2026-041',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    category: 'Electricity & Utilities',
    amount: 14500,
    payment_method: 'bkash',
    account_id: 'acc_6030',
    paid_to: 'DESCO Motijheel Billing Counter',
    description: 'DESCO Electricity Bill for September 2026',
    approved_by: 'Kamrul Hasan (GM)',
    created_by: 'Tariqul Islam',
    created_at: '2026-10-02T10:15:00'
  },
  {
    id: 'exp_2',
    voucher_no: 'EXP-2026-042',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    category: 'Internet & Software',
    amount: 3500,
    payment_method: 'cash',
    account_id: 'acc_6040',
    paid_to: 'Carnival Internet Provider',
    description: 'High-speed dedicated optical fiber monthly subscription',
    approved_by: 'Fahim Rahman (Mgr)',
    created_by: 'Fahim Rahman',
    created_at: '2026-10-04T16:00:00'
  },
  {
    id: 'exp_3',
    voucher_no: 'EXP-2026-043',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    category: 'Marketing & Promotion',
    amount: 25000,
    payment_method: 'bank',
    account_id: 'acc_6060',
    paid_to: 'Digital Wave Advertising Agency',
    description: 'Facebook & Google Ad boost for Durga Puja festive promotion',
    approved_by: 'Al-Amin Chowdhury (Owner)',
    created_by: 'Nasir Uddin',
    created_at: '2026-10-05T12:00:00'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp_1',
    emp_id: 'EMP-001',
    name: 'Al-Amin Chowdhury',
    phone: '01711-000111',
    designation: 'Managing Director & Founder',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 150000,
    monthly_target: 3000000,
    monthly_sales: 3250000,
    achievement_rate: 108.3,
    rating: 'A',
    status: 'active',
    joining_date: '2020-01-01'
  },
  {
    id: 'emp_2',
    emp_id: 'EMP-002',
    name: 'Kamrul Hasan',
    phone: '01711-000222',
    designation: 'General Manager (Operations)',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 85000,
    monthly_target: 2500000,
    monthly_sales: 2420000,
    achievement_rate: 96.8,
    rating: 'A',
    status: 'active',
    joining_date: '2021-03-01'
  },
  {
    id: 'emp_3',
    emp_id: 'EMP-003',
    name: 'Tariqul Islam',
    phone: '01711-223344',
    designation: 'Branch Manager',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 55000,
    monthly_target: 1800000,
    monthly_sales: 1950000,
    achievement_rate: 108.3,
    rating: 'A',
    status: 'active',
    joining_date: '2022-02-15'
  },
  {
    id: 'emp_4',
    emp_id: 'EMP-004',
    name: 'Fahim Rahman',
    phone: '01819-334455',
    designation: 'Branch Manager',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    salary: 58000,
    monthly_target: 2200000,
    monthly_sales: 2110000,
    achievement_rate: 95.9,
    rating: 'B',
    status: 'active',
    joining_date: '2022-05-10'
  },
  {
    id: 'emp_5',
    emp_id: 'EMP-005',
    name: 'Mahmudul Hasan',
    phone: '01912-445566',
    designation: 'Branch Manager',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    salary: 50000,
    monthly_target: 1400000,
    monthly_sales: 1210000,
    achievement_rate: 86.4,
    rating: 'B',
    status: 'active',
    joining_date: '2023-01-05'
  },
  {
    id: 'emp_6',
    emp_id: 'EMP-006',
    name: 'Nasir Uddin, FCMA',
    phone: '01712-334455',
    designation: 'Head of Accounts & Finance',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 70000,
    monthly_target: 0,
    monthly_sales: 0,
    achievement_rate: 100,
    rating: 'A',
    status: 'active',
    joining_date: '2021-08-01'
  },
  {
    id: 'emp_7',
    emp_id: 'EMP-007',
    name: 'Mehedi Hasan',
    phone: '01611-224466',
    designation: 'Senior Sales Executive & Cashier',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 32000,
    monthly_target: 900000,
    monthly_sales: 1020000,
    achievement_rate: 113.3,
    rating: 'A',
    status: 'active',
    joining_date: '2023-04-12'
  },
  {
    id: 'emp_8',
    emp_id: 'EMP-008',
    name: 'Tanima Akter',
    phone: '01815-998877',
    designation: 'Sales Executive (Accessories & Gadgets)',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Mall',
    salary: 28000,
    monthly_target: 600000,
    monthly_sales: 580000,
    achievement_rate: 96.6,
    rating: 'B',
    status: 'active',
    joining_date: '2023-07-01'
  },
  {
    id: 'emp_9',
    emp_id: 'EMP-009',
    name: 'Shakil Ahmed',
    phone: '01713-998877',
    designation: 'Warehouse & Inventory Manager',
    branch_id: 'br_4',
    branch_name: 'Tejgaon Central Depot (WH)',
    salary: 42000,
    monthly_target: 0,
    monthly_sales: 0,
    achievement_rate: 100,
    rating: 'A',
    status: 'active',
    joining_date: '2022-11-15'
  },
  {
    id: 'emp_10',
    emp_id: 'EMP-010',
    name: 'Sabbir Hossain',
    phone: '01511-332211',
    designation: 'Technical Support & Warranty Officer',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    salary: 26000,
    monthly_target: 0,
    monthly_sales: 0,
    achievement_rate: 100,
    rating: 'B',
    status: 'active',
    joining_date: '2024-01-10'
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att_1', employee_id: 'emp_3', employee_name: 'Tariqul Islam', branch_id: 'br_1', date: '2026-10-08', status: 'present', in_time: '09:48 AM', out_time: '' },
  { id: 'att_2', employee_id: 'emp_4', employee_name: 'Fahim Rahman', branch_id: 'br_2', date: '2026-10-08', status: 'present', in_time: '10:15 AM', out_time: '' },
  { id: 'att_3', employee_id: 'emp_5', employee_name: 'Mahmudul Hasan', branch_id: 'br_3', date: '2026-10-08', status: 'present', in_time: '09:55 AM', out_time: '' },
  { id: 'att_4', employee_id: 'emp_7', employee_name: 'Mehedi Hasan', branch_id: 'br_1', date: '2026-10-08', status: 'present', in_time: '09:40 AM', out_time: '' },
  { id: 'att_5', employee_id: 'emp_8', employee_name: 'Tanima Akter', branch_id: 'br_2', date: '2026-10-08', status: 'late', in_time: '11:05 AM', notes: 'Traffic delay at Farmgate' },
  { id: 'att_6', employee_id: 'emp_9', employee_name: 'Shakil Ahmed', branch_id: 'br_4', date: '2026-10-08', status: 'present', in_time: '08:50 AM', out_time: '' }
];

export const initialJournals: JournalEntry[] = [
  {
    id: 'jrn_1',
    entry_no: 'JRN-2026-101',
    date: '2026-10-06',
    reference_type: 'sale',
    reference_id: 'INV-2026-089',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    narration: 'Posted Sale INV-2026-089 (Galaxy S24 Ultra + Charger) to Tanvir Hossain',
    lines: [
      { id: 'jl_1', account_id: 'acc_1010', account_code: '1010', account_name: 'Cash in Hand - Motijheel', debit: 50000, credit: 0, branch_id: 'br_1', description: 'Cash collected' },
      { id: 'jl_2', account_id: 'acc_1030', account_code: '1030', account_name: 'bKash Merchant Account', debit: 89749, credit: 0, branch_id: 'br_1', description: 'bKash Trx' },
      { id: 'jl_3', account_id: 'acc_1020', account_code: '1020', account_name: 'City Bank Ltd. Current A/C', debit: 50000, credit: 0, branch_id: 'br_1', description: 'City Bank POS swipe' },
      { id: 'jl_4', account_id: 'acc_4010', account_code: '4010', account_name: 'Mobile Phone Sales Revenue', debit: 0, credit: 187999, branch_id: 'br_1', description: 'S24 Ultra Sales Rev' },
      { id: 'jl_5', account_id: 'acc_4020', account_code: '4020', account_name: 'Accessories Sales Revenue', debit: 0, credit: 1750, branch_id: 'br_1', description: 'Samsung Adapter Sales Rev' },
      // COGS & Inventory lines
      { id: 'jl_6', account_id: 'acc_5010', account_code: '5010', account_name: 'COGS - Mobile Phones', debit: 168000, credit: 0, branch_id: 'br_1', description: 'Cost of S24 Ultra' },
      { id: 'jl_7', account_id: 'acc_5020', account_code: '5020', account_name: 'COGS - Accessories', debit: 1200, credit: 0, branch_id: 'br_1', description: 'Cost of Samsung Adapter' },
      { id: 'jl_8', account_id: 'acc_1200', account_code: '1200', account_name: 'Inventory Asset - Mobile Phones', debit: 0, credit: 168000, branch_id: 'br_1', description: 'Stock reduction S24 Ultra' },
      { id: 'jl_9', account_id: 'acc_1210', account_code: '1210', account_name: 'Inventory Asset - Accessories', debit: 0, credit: 1200, branch_id: 'br_1', description: 'Stock reduction Adapter' }
    ],
    total_debit: 358949,
    total_credit: 358949,
    is_posted: true,
    created_by: 'Mehedi Hasan',
    created_at: '2026-10-06T14:30:00'
  }
];

export const initialTransfers: StockTransfer[] = [
  {
    id: 'trf_1',
    transfer_no: 'TRF-2026-014',
    from_branch_id: 'br_4',
    from_branch_name: 'Tejgaon Central Depot (WH)',
    to_branch_id: 'br_1',
    to_branch_name: 'Motijheel Flagship Store',
    product_id: 'prd_1',
    product_name: 'Samsung Galaxy S24 Ultra 5G',
    quantity: 2,
    imei_numbers: ['358249110294821', '358249110294825'],
    status: 'received',
    sent_by_name: 'Shakil Ahmed',
    received_by_name: 'Tariqul Islam',
    created_at: '2026-09-18T11:00:00',
    received_at: '2026-09-18T16:20:00'
  }
];

export const initialAlerts: AlertNotification[] = [
  {
    id: 'alt_1',
    type: 'stock',
    severity: 'critical',
    title: 'Low Stock Alert: iPhone 16 Pro Max',
    message: 'Stock level in Motijheel is 1 unit. Reorder threshold is 2 units.',
    branch_id: 'br_1',
    is_read: false,
    created_at: '2026-10-08T06:30:00'
  },
  {
    id: 'alt_2',
    type: 'credit',
    severity: 'high',
    title: 'Customer Credit Limit Alert: Anik Enterprise',
    message: 'Outstanding balance (৳142,000) reached 35% of sanctioned credit limit.',
    branch_id: 'br_2',
    is_read: false,
    created_at: '2026-10-07T14:00:00'
  },
  {
    id: 'alt_3',
    type: 'cash',
    severity: 'medium',
    title: 'Physical Cash Discrepancy Flag',
    message: 'Bashundhara City reported ৳150 difference during yesterday night count.',
    branch_id: 'br_2',
    is_read: true,
    created_at: '2026-10-07T21:45:00'
  }
];

export const initialApprovals: ApprovalRequest[] = [
  {
    id: 'appr_1',
    request_type: 'discount_override',
    reference_id: 'QUOT-2026-012',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    requester_name: 'Mehedi Hasan',
    amount: 4500,
    details: 'Corporate bulk customer requesting ৳4,500 extra discount on 3x Galaxy S24 Ultra',
    status: 'pending',
    created_at: '2026-10-08T06:50:00'
  },
  {
    id: 'appr_2',
    request_type: 'credit_limit_override',
    reference_id: 'cust_5',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    requester_name: 'Tariqul Islam',
    amount: 350000,
    details: 'Requesting temporary credit limit increase from 300,000 to 350,000 for Chowdhury Mobile Palace',
    status: 'pending',
    created_at: '2026-10-07T16:30:00'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud_1',
    user_name: 'Mehedi Hasan',
    role: 'cashier',
    action: 'post',
    module: 'Sales / POS',
    record_id: 'INV-2026-089',
    summary: 'Posted Sale Invoice INV-2026-089 (৳189,749) with IMEI: 358249110294825',
    ip_address: '103.145.12.89',
    created_at: '2026-10-06T14:30:05'
  },
  {
    id: 'aud_2',
    user_name: 'Tariqul Islam',
    role: 'branch_manager',
    action: 'update',
    module: 'Inventory',
    record_id: 'imei_103',
    summary: 'Status transition from in_stock to sold for device S24 Ultra',
    ip_address: '103.145.12.89',
    created_at: '2026-10-06T14:30:06'
  },
  {
    id: 'aud_3',
    user_name: 'Nasir Uddin',
    role: 'accountant',
    action: 'post',
    module: 'Accounting Engine',
    record_id: 'JRN-2026-101',
    summary: 'Generated and balanced journal lines for invoice INV-2026-089 (Dr: ৳358,949 = Cr: ৳358,949)',
    ip_address: '103.145.12.92',
    created_at: '2026-10-06T14:30:07'
  }
];

export const initialDailyReport: DailyReport = {
  id: 'drep_2026_10_07_br1',
  report_date: '2026-10-07',
  branch_id: 'br_1',
  branch_name: 'Motijheel Flagship Store',
  target_sales: 120000,
  actual_sales: 145000,
  achievement_pct: 120.8,
  opening_cash: 50000,
  cash_sales: 85000,
  cash_collections: 25000,
  cash_expenses: 15000,
  cash_deposits: 0,
  expected_closing_cash: 145000,
  physical_closing_cash: 145000,
  cash_difference: 0,
  denomination: {
    note_1000: 120,
    note_500: 45,
    note_200: 10,
    note_100: 5,
    note_50: 0,
    note_20: 0,
    note_10: 0,
    coins: 0,
    total_physical_cash: 145000
  },
  mfs_bkash_sales: 35000,
  mfs_nagad_sales: 15000,
  bank_sales: 10000,
  credit_sales: 0,
  opening_checklist: {
    store_opened_on_time: true,
    employee_attendance_checked: true,
    opening_cash_verified: true,
    previous_closing_verified: true,
    pos_software_ready: true,
    internet_verified: true,
    display_stock_checked: true,
    pending_issues_reviewed: true
  },
  closing_checklist: {
    sales_reconciled: true,
    cash_counted: true,
    stock_issues_verified: true,
    imei_scanned_verified: true,
    all_expenses_entered: true,
    pending_tasks_logged: true,
    report_submitted: true
  },
  employee_attendance_count: { present: 4, late: 0, absent: 0 },
  customer_complaints_count: 0,
  imei_mismatch_count: 0,
  problems_logged: ['Power fluctuation between 2:00 PM and 2:30 PM, generator switched seamlessly.'],
  manager_notes: 'Strong footfall in the evening. S24 Ultra and Xiaomi Note 13 models moved well.',
  status: 'approved',
  submitted_by: 'Tariqul Islam',
  submitted_at: '2026-10-07T20:45:00',
  approved_by: 'Kamrul Hasan (GM)',
  approved_at: '2026-10-07T21:15:00'
};

export const initialWeeklyReport: WeeklyReport = {
  id: 'wrep_2026_w40',
  week_label: 'Week 40 (Oct 01 - Oct 07, 2026)',
  start_date: '2026-10-01',
  end_date: '2026-10-07',
  branch_id: 'all',
  branch_name: 'All Branches Consolidated',
  total_sales: 1125000,
  target_sales: 1050000,
  achievement_pct: 107.1,
  growth_pct: 8.4,
  top_models: [
    { rank: 1, product_name: 'Samsung Galaxy S24 Ultra 5G', category: 'Smartphones', quantity_sold: 4, sales_value: 759996, profit: 87996 },
    { rank: 2, product_name: 'Apple iPhone 16 Pro Max', category: 'Smartphones', quantity_sold: 2, sales_value: 409998, profit: 45998 },
    { rank: 3, product_name: 'Xiaomi Redmi Note 13 Pro+ 5G', category: 'Smartphones', quantity_sold: 5, sales_value: 209995, profit: 27495 },
    { rank: 4, product_name: 'Anker 511 Charger (Nano Pro 20W)', category: 'Accessories', quantity_sold: 24, sales_value: 42000, profit: 14400 },
    { rank: 5, product_name: 'Baseus 100W Fast Cable', category: 'Accessories', quantity_sold: 38, sales_value: 32300, profit: 14060 }
  ],
  slow_moving_stock: [
    { id: 'prd_7', product_name: 'Realme 12 Pro+ 5G (Submarine Blue)', stock_quantity: 4, days_in_stock: 48, stock_value: 172000, recommended_action: 'Promotion' },
    { id: 'prd_8', product_name: 'Symphony D45 Dual SIM', stock_quantity: 22, days_in_stock: 52, stock_value: 24200, recommended_action: 'Bundle Offer' }
  ],
  stock_control: {
    total_stock_value: 7320000,
    physical_stock_diff: 0,
    imei_mismatch: 0,
    damaged_stock_qty: 0,
    warranty_stock_qty: 1,
    returned_stock_qty: 1
  },
  cash_accounts: {
    total_collection: 412000,
    total_expense: 43000,
    outstanding_collection: 125000,
    supplier_payable: 1097000,
    cash_difference: 0
  },
  problems: [
    'Courier delay from Tejgaon warehouse to Uttara branch due to Airport road gridlock',
    'High customer demand for iPhone 16 Pro 128GB Desert Titanium color (currently out of stock)'
  ],
  actions_taken: [
    'Re-routed stock delivery van during early morning 8:00 AM window',
    'Placed urgent advance booking order for 5x iPhone 16 units with Apex Telecom'
  ],
  next_week_plan: {
    sales: 'Achieve ৳1,250,000 weekly target with Puja weekend sales push',
    stock: 'Complete physical IMEI barcode scanning audit in all 3 branches',
    employee: 'Conduct Anker & Baseus product upselling training for sales executives',
    customer: 'Follow up on ৳142,000 outstanding receivable from Anik Enterprise',
    cost_control: 'Audit showroom AC usage to decrease electricity expenses by 10%'
  },
  manager_comments: {
    best_achievement: 'Exceeded target by 7.1% driven by strong S24 Ultra corporate sales.',
    biggest_problem: 'Stock shortage of desert titanium color on flagship iPhone models.',
    most_important_action: 'Expedite urgent goods receipt from Apex Distribution.',
    owner_decision_required: 'Approve ৳500,000 supplier payment cheque to Apex Telecom.'
  },
  status: 'approved',
  submitted_by: 'Kamrul Hasan (GM)',
  submitted_at: '2026-10-07T22:00:00',
  approved_by: 'Al-Amin Chowdhury (Owner)'
};

export const initialMonthlyReport: MonthlyReport = {
  id: 'mrep_2026_09',
  month_label: 'September 2026',
  year: 2026,
  month: 9,
  branch_id: 'all',
  branch_name: 'Consolidated Business Review',
  summary: {
    total_sales: 4850000,
    gross_profit: 692000,
    net_profit: 412500,
    total_stock_value: 7320000,
    cash_and_bank: 2945900,
    customer_outstanding: 430500,
    major_achievement: 'Crossed ৳4.8M monthly sales with gross profit margin 14.3%',
    major_issue: 'Working capital tied up in slow-moving Realme 12 Pro inventory'
  },
  branch_sales_breakdown: [
    { branch_name: 'Motijheel Flagship Store', target: 2000000, actual: 2150000, achievement_pct: 107.5, growth_pct: 12.1 },
    { branch_name: 'Bashundhara City Mega Mall', target: 1800000, actual: 1890000, achievement_pct: 105.0, growth_pct: 9.4 },
    { branch_name: 'Uttara Sector-7 Hub', target: 1000000, actual: 810000, achievement_pct: 81.0, growth_pct: -3.2 }
  ],
  profit_analysis: [
    { category: 'Mobile', sales: 4350000, cost: 3820000, gross_profit: 530000, margin_pct: 12.2 },
    { category: 'Accessories', sales: 470000, cost: 312000, gross_profit: 158000, margin_pct: 33.6 },
    { category: 'Other', sales: 30000, cost: 4000, gross_profit: 26000, margin_pct: 86.7 },
    { category: 'Total', sales: 4850000, cost: 4136000, gross_profit: 714000, margin_pct: 14.7 }
  ],
  expenses_breakdown: [
    { category: 'Showroom & Warehouse Rent', amount: 140000, percentage: 46.4 },
    { category: 'Staff Salaries & Bonus', amount: 95000, percentage: 31.5 },
    { category: 'Electricity & Utilities', amount: 26000, percentage: 8.6 },
    { category: 'Marketing & Promotion', amount: 22000, percentage: 7.3 },
    { category: 'Internet & Software', amount: 10500, percentage: 3.5 },
    { category: 'Office Maintenance & Courier', amount: 8000, percentage: 2.7 }
  ],
  stock_reconciliation: {
    opening_stock: 6850000,
    purchases: 4600000,
    sales_cost: 4136000,
    transfers_net: 0,
    returns_net: 0,
    closing_stock: 7314000,
    dead_slow_stock_value: 196200
  },
  imei_audit: {
    total_imei: 142,
    matched: 142,
    mismatch: 0,
    missing: 0,
    warranty: 1,
    returned: 1
  },
  customer_outstanding: {
    opening: 380000,
    new_credit: 245000,
    collected: 194500,
    closing: 430500,
    major_debtors: [
      { customer_name: 'Chowdhury Mobile Palace', amount: 185000, age_days: 28, action: 'Legal notice & stop credit line' },
      { customer_name: 'Anik Enterprise', amount: 142000, age_days: 14, action: 'Weekly recovery meeting scheduled' },
      { customer_name: 'Rahim Telecom & Electronics', amount: 75000, age_days: 8, action: 'Normal credit cycle payment pending' }
    ]
  },
  supplier_payable: {
    opening: 1250000,
    new_credit: 1100000,
    paid: 1253000,
    closing: 1097000
  },
  branch_rankings: [
    { rank: 1, branch_name: 'Motijheel Flagship Store', sales: 2150000, profit: 320000, turnover: 1.4, collection: 94, score: 92.5 },
    { rank: 2, branch_name: 'Bashundhara City Mega Mall', sales: 1890000, profit: 285000, turnover: 1.2, collection: 89, score: 87.0 },
    { rank: 3, branch_name: 'Uttara Sector-7 Hub', sales: 810000, profit: 109000, turnover: 0.9, collection: 82, score: 73.5 }
  ],
  major_problems: [
    'Uttara branch missed monthly sales target by 19% due to metro rail construction and parking barrier',
    'Accessories cross-sell ratio is 9.7% of total revenue; market benchmark is 15%',
    'Late payment collection from Chowdhury Mobile Palace (overdue 28 days)'
  ],
  solutions_implemented: [
    'Launched home delivery in Uttara Sector 1-14 with free courier on order > ৳10,000',
    'Introduced 5% combo discount when purchasing phone + charger + glass together',
    'Placed hold on new dispatches to Chowdhury Mobile Palace until 50% recovery'
  ],
  recommendations: {
    sales_increase: 'Focus on festival packages and corporate seasonal tie-ups',
    stock_improvement: 'Automate weekly transfer of slow-moving handsets to Bashundhara Mall',
    employee_improvement: 'Reward top performer Mehedi Hasan with quarterly bonus',
    cost_reduction: 'Shift to solar backup inverter for Uttara showroom to cut fuel cost',
    customer_service: 'Launch WhatsApp warranty confirmation bot for customer peace of mind'
  },
  next_month_targets: {
    sales: 5500000,
    profit: 800000,
    collection: 350000,
    stock: 7000000,
    outstanding_reduction: 150000
  },
  owner_decisions: [
    'Approve leasing adjoining shop space for Bashundhara City expansion',
    'Sanction seasonal Puja credit line enhancement with Fair Electronics (Samsung)'
  ],
  manager_final_comment: 'Overall solid quarter ending. If Uttara branch footfall improves and accessories share touches 15%, net margins will expand to 12%+. Submitted for Chairman/Owner signature.',
  status: 'approved',
  submitted_by: 'Kamrul Hasan (GM)',
  submitted_at: '2026-10-02T19:00:00',
  approved_by: 'Al-Amin Chowdhury (Owner)'
};

export const initialWarranties: WarrantyCase[] = [
  {
    id: 'war_1',
    ticket_no: 'WAR-2026-008',
    imei: '359102948192003',
    product_name: 'Apple iPhone 16 Pro',
    brand_name: 'Apple',
    customer_name: 'Sadia Gadget World',
    customer_phone: '01911-556677',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    issue_description: 'Earpiece speaker cracking sound during cellular calls',
    status: 'sent_to_brand',
    received_date: '2026-10-04',
    expected_return_date: '2026-10-14',
    service_charge: 0,
    notes: 'Sent to Apex Telecom Apple authorized service depot'
  },
  {
    id: 'war_2',
    ticket_no: 'WAR-2026-009',
    imei: '869201948102931',
    product_name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand_name: 'Xiaomi',
    customer_name: 'Tanvir Hossain',
    customer_phone: '01715-667788',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    issue_description: 'Charging port loose connection (120W fast charging dropping)',
    status: 'repaired',
    received_date: '2026-10-02',
    resolved_date: '2026-10-06',
    service_charge: 0,
    notes: 'Port flex replaced under official Xiaomi brand warranty'
  }
];

export const initialComplaints: CustomerComplaint[] = [
  {
    id: 'cmp_1',
    ticket_no: 'CMP-2026-015',
    customer_name: 'Chowdhury Mobile Palace',
    customer_phone: '01611-778899',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    category: 'delayed_warranty',
    subject: 'Delayed warranty repair turnaround for Samsung device',
    description: 'Customer claims handset was submitted 10 days ago without status SMS update.',
    priority: 'high',
    status: 'investigating',
    resolution_notes: 'Branch manager contacted customer; replacement expedited from warehouse.',
    created_at: '2026-10-05T11:00:00'
  },
  {
    id: 'cmp_2',
    ticket_no: 'CMP-2026-016',
    customer_name: 'Rahim Telecom & Electronics',
    customer_phone: '01712-334455',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    category: 'billing',
    subject: 'Credit ledger reconciliation inquiry',
    description: 'Requested duplicate copy of September statement.',
    priority: 'medium',
    status: 'resolved',
    resolution_notes: 'Statement PDF sent via WhatsApp and printed ledger handed over.',
    created_at: '2026-10-06T15:20:00',
    resolved_at: '2026-10-06T16:00:00'
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'quot_1',
    quotation_no: 'QUOT-2026-012',
    customer_name: 'Green Tech BD Enterprise',
    customer_phone: '01711-889900',
    company_name: 'Green Tech BD Ltd.',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    items: [
      {
        product_id: 'prd_1',
        product_name: 'Samsung Galaxy S24 Ultra 5G (512GB)',
        model: 'Galaxy S24 Ultra',
        quantity: 3,
        unit_price: 189999,
        discount: 3000,
        subtotal: 560997
      },
      {
        product_id: 'prd_10',
        product_name: 'Samsung 25W Type-C Super Fast Adapter',
        model: 'EP-TA800',
        quantity: 3,
        unit_price: 1850,
        discount: 150,
        subtotal: 5100
      }
    ],
    subtotal: 575547,
    discount: 9450,
    total_amount: 566097,
    valid_until: '2026-10-20',
    notes: 'Corporate fleet purchase for executive management. Includes official brand warranty.',
    status: 'active',
    created_by: 'Mehedi Hasan',
    created_at: '2026-10-07T12:00:00'
  }
];

export const initialSalesReturns: SalesReturn[] = [
  {
    id: 'ret_1',
    return_no: 'RET-2026-004',
    invoice_no: 'INV-2026-081',
    customer_name: 'Sadia Gadget World',
    customer_phone: '01911-556677',
    branch_id: 'br_3',
    branch_name: 'Uttara Sector-7 Hub',
    items: [
      {
        product_id: 'prd_9',
        product_name: 'Anker 511 Charger (Nano Pro 20W)',
        quantity: 2,
        refund_unit_price: 1750,
        subtotal: 3500
      }
    ],
    total_refund: 3500,
    refund_method: 'credit_note',
    reason: 'Customer mistakenly ordered Type-C adapter instead of Lightning cord; credited to customer ledger.',
    journal_entry_id: 'JRN-2026-095',
    created_by: 'Mahmudul Hasan',
    created_at: '2026-10-05T14:10:00'
  }
];

export const initialBankReconciliations: BankReconciliationRecord[] = [
  {
    id: 'recon_1',
    account_id: 'acc_1020',
    account_name: 'City Bank Ltd. Current A/C (11029384)',
    statement_date: '2026-09-30',
    book_balance: 1450000,
    bank_statement_balance: 1450000,
    variance: 0,
    status: 'matched',
    notes: 'September bank statement fully reconciled with ERP general ledger.',
    reconciled_by: 'Nasir Uddin, FCMA',
    created_at: '2026-10-01T17:00:00'
  },
  {
    id: 'recon_2',
    account_id: 'acc_1030',
    account_name: 'bKash Merchant Account (01711002233)',
    statement_date: '2026-10-07',
    book_balance: 345000,
    bank_statement_balance: 345000,
    variance: 0,
    status: 'matched',
    notes: 'Daily bKash merchant portal batch statement matched with POS transactions.',
    reconciled_by: 'Tariqul Islam',
    created_at: '2026-10-07T21:00:00'
  }
];

export const initialSMSLogs: SMSNotificationLog[] = [
  {
    id: 'sms_1',
    recipient_phone: '01715-667788',
    customer_name: 'Tanvir Hossain',
    template_type: 'sale_invoice',
    message: 'Dear Tanvir Hossain, Thank you for purchasing Samsung S24 Ultra (IMEI: 358249110294825) from SmartPhone Galaxy BD Motijheel. Inv #INV-2026-089, Total: BDT 189,749. Hotline: 01711002233',
    channel: 'sms',
    status: 'delivered',
    created_at: '2026-10-06T14:31:00'
  },
  {
    id: 'sms_2',
    recipient_phone: '01819-445566',
    customer_name: 'Anik Enterprise',
    template_type: 'due_reminder',
    message: 'Dear Anik Enterprise, Reminder from SmartPhone Galaxy BD: Your outstanding credit balance is BDT 142,000. Kindly settle via City Bank or bKash merchant. Contact: 01819334455',
    channel: 'whatsapp',
    status: 'delivered',
    created_at: '2026-10-07T10:00:00'
  }
];

export const initialInstallments: InstallmentAgreement[] = [
  {
    id: 'inst_1',
    agreement_no: 'EMI-2026-001',
    customer_id: 'cust_1',
    customer_name: 'Tanvir Hossain',
    customer_phone: '01715-667788',
    customer_nid: '19922694012000491',
    guarantor_name: 'Rafiqul Islam (Brother)',
    guarantor_phone: '01712-998877',
    guarantor_relation: 'Brother / Govt Officer',
    guarantor_nid: '19882694012000312',
    product_id: 'prd_1',
    product_name: 'Samsung Galaxy S24 Ultra',
    imei: '358249110294825',
    branch_id: 'br_1',
    branch_name: 'Motijheel Flagship Store',
    cash_price: 189749,
    down_payment: 50000,
    financed_amount: 139749,
    interest_rate_percent: 0,
    total_installments: 6,
    monthly_amount: 23291.5,
    total_payable: 189749,
    total_paid: 96583,
    remaining_due: 93166,
    start_date: '2026-08-10',
    status: 'active',
    schedule: [
      {
        installment_no: 1,
        due_date: '2026-09-10',
        amount: 23291.5,
        status: 'paid',
        paid_date: '2026-09-08',
        paid_amount: 23291.5,
        payment_method: 'bkash',
        receipt_no: 'EMI-REC-001'
      },
      {
        installment_no: 2,
        due_date: '2026-10-10',
        amount: 23291.5,
        status: 'paid',
        paid_date: '2026-10-05',
        paid_amount: 23291.5,
        payment_method: 'cash',
        receipt_no: 'EMI-REC-002'
      },
      {
        installment_no: 3,
        due_date: '2026-11-10',
        amount: 23291.5,
        status: 'pending'
      },
      {
        installment_no: 4,
        due_date: '2026-12-10',
        amount: 23291.5,
        status: 'pending'
      },
      {
        installment_no: 5,
        due_date: '2027-01-10',
        amount: 23291.5,
        status: 'pending'
      },
      {
        installment_no: 6,
        due_date: '2027-02-10',
        amount: 23291.5,
        status: 'pending'
      }
    ],
    created_at: '2026-08-10T11:00:00'
  },
  {
    id: 'inst_2',
    agreement_no: 'EMI-2026-002',
    customer_id: 'cust_3',
    customer_name: 'Shahriar Kabir',
    customer_phone: '01817-223344',
    customer_nid: '19952694012000888',
    guarantor_name: 'Dr. Enamul Kabir (Father)',
    guarantor_phone: '01819-112233',
    guarantor_relation: 'Father / Professor',
    guarantor_nid: '19652694012000101',
    product_id: 'prd_4',
    product_name: 'Xiaomi Redmi Note 13 Pro+',
    imei: '869201948102931',
    branch_id: 'br_2',
    branch_name: 'Bashundhara City Mega Store',
    cash_price: 48999,
    down_payment: 15000,
    financed_amount: 33999,
    interest_rate_percent: 0,
    total_installments: 3,
    monthly_amount: 11333,
    total_payable: 48999,
    total_paid: 26333,
    remaining_due: 22666,
    start_date: '2026-09-01',
    status: 'active',
    schedule: [
      {
        installment_no: 1,
        due_date: '2026-10-01',
        amount: 11333,
        status: 'paid',
        paid_date: '2026-10-01',
        paid_amount: 11333,
        payment_method: 'bank',
        receipt_no: 'EMI-REC-003'
      },
      {
        installment_no: 2,
        due_date: '2026-11-01',
        amount: 11333,
        status: 'pending'
      },
      {
        installment_no: 3,
        due_date: '2026-12-01',
        amount: 11333,
        status: 'pending'
      }
    ],
    created_at: '2026-09-01T15:20:00'
  }
];

export const initialVoiceConfig: VoiceFeedbackConfig = {
  enabled: true,
  language: 'bn-BD',
  volume: 1.0,
  rate: 0.95,
  autoSpeakAlerts: true
};

export const initialAnomalies: AIAnomalyRecord[] = [
  {
    id: 'anom_1',
    type: 'loss_sale',
    severity: 'critical',
    status: 'auto_corrected',
    module: 'pos',
    record_id: 'sale_101',
    reference_no: 'INV-2026-101',
    title: 'ক্রয়মূল্যের চেয়ে কমে বিক্রয় রোধ (Loss Sale Prevented)',
    description: 'iPhone 15 Pro Max এর বিক্রয়মূল্য ৳১১০,০০০ দেওয়া হয়েছিল, যেখানে গড় ক্রয়মূল্য ৳১৪৮,০০০।',
    reason: 'ক্রয়মূল্য অপেক্ষা কম মূল্যে বিক্রয় নিষিদ্ধ (RULE_NO_NEGATIVE_MARGIN)',
    detected_value: 110000,
    suggested_value: 154000,
    applied_value: 154000,
    user_id: 'usr_5',
    user_name: 'Farhan Ahmed',
    user_role: 'cashier',
    rule_applied: 'RULE_NO_NEGATIVE_MARGIN',
    financial_impact: 38000,
    created_at: '2026-10-07T11:30:00Z',
    resolved_at: '2026-10-07T11:30:05Z',
    resolved_by: 'AI Owner Guardian Engine',
    resolution_notes: 'সিস্টেম স্বয়ংক্রিয়ভাবে অনুমোদিত ন্যূনতম নিরাপদ বিক্রয়মূল্য প্রয়োগ করেছে।',
    is_recurrent: false,
    recurrent_count: 1
  },
  {
    id: 'anom_2',
    type: 'customer_tier_mismatch',
    severity: 'high',
    status: 'auto_corrected',
    module: 'sales',
    record_id: 'sale_102',
    reference_no: 'INV-2026-102',
    title: 'হোলসেল কাস্টমার মূল্যের অসংগতি সংশোধন (Wholesale Tier Enforcement)',
    description: 'কর্পোরেট হোলসেল পার্টনার Trust Mobile Hub এর চালানে খুচরা রেট ৳১৩৯,০০০ ধরা হয়েছিল।',
    reason: 'হোলসেল কাস্টমারদের জন্য নির্ধারিত পাইকারি মূল্য তালিকা প্রয়োগ বাধ্যতামুলক',
    detected_value: 139000,
    suggested_value: 129000,
    applied_value: 129000,
    user_id: 'usr_4',
    user_name: 'Kamrul Hasan',
    user_role: 'sales_executive',
    rule_applied: 'RULE_WHOLESALE_TIER_POLICY',
    financial_impact: 10000,
    created_at: '2026-10-07T14:15:00Z',
    resolved_at: '2026-10-07T14:15:10Z',
    resolved_by: 'AI Owner Guardian Engine',
    resolution_notes: 'অনুমোদিত হোলসেল পলিসি অনুযায়ী ইনভয়েস রেট সমন্বয় করা হয়েছে।',
    is_recurrent: true,
    recurrent_count: 2
  },
  {
    id: 'anom_3',
    type: 'ledger_unbalanced',
    severity: 'critical',
    status: 'pending_approval',
    module: 'accounting',
    record_id: 'jrn_99',
    reference_no: 'JRN-2026-99',
    title: 'অসম ডেবিট ও ক্রেডিট শনাক্তকরণ (Unbalanced Journal)',
    description: 'ম্যানুয়াল জার্নাল এন্ট্রিতে ডেবিট ৳২৫,০০০ কিন্তু ক্রেডিট ৳২০,০০০ (পার্থক্য ৳৫,০০০)।',
    reason: 'ডাবল এন্ট্রি নীতিমালায় ডেবিট ও ক্রেডিট সর্বদা সমান হতে হবে।',
    detected_value: { debit: 25000, credit: 20000 },
    suggested_value: { debit: 25000, credit: 25000 },
    user_id: 'usr_6',
    user_name: 'Mahmudul Hasan',
    user_role: 'accountant',
    rule_applied: 'RULE_DOUBLE_ENTRY_BALANCE',
    financial_impact: 5000,
    created_at: '2026-10-08T09:40:00Z',
    is_recurrent: false,
    recurrent_count: 1
  },
  {
    id: 'anom_4',
    type: 'discount_excess',
    severity: 'medium',
    status: 'approved',
    module: 'pos',
    record_id: 'sale_104',
    reference_no: 'INV-2026-104',
    title: 'অস্বাভাবিক ডিসকাউন্ট সীমা অতিক্রম (Discount Cap Override)',
    description: 'Xiaomi Redmi Note 13 এ ৳৫,৫০০ ডিসকাউন্ট দেওয়া হয়েছিল যা গ্রস মার্জিনকে শূন্য করেছিল।',
    reason: 'সর্বোচ্চ অনুমোদিত ডিসকাউন্ট মার্জিনের ৫০% এর বেশি হতে পারবে না।',
    detected_value: 5500,
    suggested_value: 2000,
    applied_value: 2000,
    user_id: 'usr_5',
    user_name: 'Farhan Ahmed',
    user_role: 'cashier',
    rule_applied: 'RULE_MAX_DISCOUNT_CAP',
    financial_impact: 3500,
    created_at: '2026-10-08T16:00:00Z',
    resolved_at: '2026-10-08T16:05:00Z',
    resolved_by: 'Owner (Tanvir Ahmed)',
    resolution_notes: 'মালিক কর্তৃক বিশেষ অনুমোদনক্রমে ক্যাপ অনুযায়ী সংশোধন করা হয়েছে।',
    is_recurrent: true,
    recurrent_count: 3
  }
];

export const initialAIAuditTrail: AIAuditTrailEntry[] = [
  {
    id: 'audit_ai_1',
    anomaly_id: 'anom_1',
    original_trx_id: 'sale_101',
    trx_type: 'sale',
    module: 'pos',
    field: 'items[0].unit_price',
    old_value: '৳110,000',
    new_value: '৳154,000',
    detected_reason: 'বিক্রয়মূল্য ক্রয়মূল্যের চেয়ে ৳৩৮,০০০ কম দেওয়া হয়েছিল',
    ai_decision: 'অটোমেটিক মার্জিন ফ্লোর প্রয়োগ এবং চালানে ন্যূনতম মূল্য নির্ধারণ',
    business_rule: 'RULE_NO_NEGATIVE_MARGIN',
    is_auto_corrected: true,
    timestamp: '2026-10-07T11:30:05Z',
    user_name: 'Farhan Ahmed'
  },
  {
    id: 'audit_ai_2',
    anomaly_id: 'anom_2',
    original_trx_id: 'sale_102',
    trx_type: 'sale',
    module: 'sales',
    field: 'items[0].unit_price',
    old_value: '৳139,000',
    new_value: '৳129,000',
    detected_reason: 'হোলসেল কাস্টমারকে রিটেল রেট চার্জ করা হয়েছিল',
    ai_decision: 'অনুমোদিত হোলসেল রেট অনুযায়ী মূল্য হ্রাস ও চালানে সমন্বয়',
    business_rule: 'RULE_WHOLESALE_TIER_POLICY',
    is_auto_corrected: true,
    timestamp: '2026-10-07T14:15:10Z',
    user_name: 'Kamrul Hasan'
  },
  {
    id: 'audit_ai_3',
    original_trx_id: 'sale_88',
    trx_type: 'sale',
    module: 'sales',
    field: 'status',
    old_value: 'voided',
    new_value: 'posted',
    detected_reason: 'ভুলবশত বাতিলকৃত চালান অ্যাডমিন কর্তৃক পুনরুদ্ধার',
    ai_decision: 'ইনভেন্টরি প্রাপ্যতা ও লেজার ডাবল-কাউন্টিং যাচাইপূর্বক সফল রিস্টোরেশন',
    business_rule: 'RULE_SAFE_ADMIN_RESTORE',
    is_auto_corrected: false,
    approver_name: 'Tanvir Ahmed (Owner)',
    timestamp: '2026-10-08T10:00:00Z',
    user_name: 'Tanvir Ahmed',
    restore_history: [
      {
        timestamp: '2026-10-08T10:00:00Z',
        restored_by: 'Tanvir Ahmed',
        reason: 'গ্রাহক পণ্য অক্ষত রেখে পুনরায় গ্রহণ করায় পূর্বের চালানটি সক্রিয় করা হলো।'
      }
    ]
  }
];

export const initialUserErrorProfiles: Record<string, UserErrorProfile> = {
  usr_5: {
    user_id: 'usr_5',
    user_name: 'Farhan Ahmed',
    total_mistakes: 3,
    recurrent_types: {
      loss_sale: 1,
      discount_excess: 2
    },
    current_warning_level: 3,
    last_warning_text: 'একই ধরনের ভুল বারবার হচ্ছে। অনুগ্রহ করে তথ্য যাচাই করুন এবং নিয়ম মেনে চালান করুন।',
    last_mistake_at: '2026-10-08T16:00:00Z'
  },
  usr_4: {
    user_id: 'usr_4',
    user_name: 'Kamrul Hasan',
    total_mistakes: 2,
    recurrent_types: {
      customer_tier_mismatch: 2
    },
    current_warning_level: 2,
    last_warning_text: 'সতর্কতা! এই লেনদেনে সম্ভাব্য মূল্য বা ছাড়ের অসংগতি রয়েছে। সংশোধন করুন।',
    last_mistake_at: '2026-10-07T14:15:00Z'
  }
};



