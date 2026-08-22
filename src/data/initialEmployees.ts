import { Employee } from '../types/employee';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'DF-1001',
    name: 'Alex Morgan',
    email: 'employee@dayflow.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    dob: '1994-06-15',
    department: 'Engineering',
    jobTitle: 'Senior Frontend Engineer',
    joiningDate: '2022-03-15',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 6500,
      hra: 2600,
      allowances: 1400,
      deductions: 950,
    },
    documents: [
      { id: 'doc-1', name: 'Offer_Letter_AlexMorgan.pdf', type: 'Offer Letter', uploadedAt: '2022-03-01', size: '1.2 MB' },
      { id: 'doc-2', name: 'Passport_ID_Proof.pdf', type: 'ID Proof', uploadedAt: '2022-03-05', size: '2.4 MB' },
      { id: 'doc-3', name: 'Employment_Agreement_2022.pdf', type: 'Employment Contract', uploadedAt: '2022-03-15', size: '3.1 MB' },
      { id: 'doc-4', name: 'Payslip_Sept_2026.pdf', type: 'Salary Slip', uploadedAt: '2026-09-30', size: '420 KB' }
    ]
  },
  {
    id: 'emp-2',
    employeeId: 'DF-1002',
    name: 'Sarah Jenkins',
    email: 'admin@dayflow.com',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: '88 King Street, Suite 400, San Francisco, CA 94107',
    dob: '1988-11-20',
    department: 'HR',
    jobTitle: 'VP of People & Operations',
    joiningDate: '2020-01-10',
    manager: 'David Chen (CEO)',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Admin',
    salary: {
      basic: 11000,
      hra: 4400,
      allowances: 2600,
      deductions: 1800,
    },
    documents: [
      { id: 'doc-201', name: 'Executive_Offer_Letter.pdf', type: 'Offer Letter', uploadedAt: '2020-01-02', size: '1.8 MB' },
      { id: 'doc-202', name: 'Passport_ID.pdf', type: 'ID Proof', uploadedAt: '2020-01-05', size: '2.1 MB' }
    ]
  },
  {
    id: 'emp-3',
    employeeId: 'DF-1003',
    name: 'Marcus Vance',
    email: 'hr@dayflow.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: '120 Market Street, San Francisco, CA 94105',
    dob: '1992-04-12',
    department: 'HR',
    jobTitle: 'HR Operations Lead',
    joiningDate: '2021-06-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'HR',
    salary: {
      basic: 5800,
      hra: 2320,
      allowances: 1200,
      deductions: 850,
    },
    documents: [
      { id: 'doc-301', name: 'Offer_Letter_Marcus.pdf', type: 'Offer Letter', uploadedAt: '2021-05-15', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-4',
    employeeId: 'DF-1004',
    name: 'Elena Rostova',
    email: 'elena.r@dayflow.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    address: '450 Mission Bay Blvd, San Francisco, CA 94158',
    dob: '1993-08-25',
    department: 'Design',
    jobTitle: 'Lead Product Designer',
    joiningDate: '2021-09-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 7200,
      hra: 2880,
      allowances: 1600,
      deductions: 1050,
    },
    documents: [
      { id: 'doc-401', name: 'Offer_Letter_Elena.pdf', type: 'Offer Letter', uploadedAt: '2021-08-20', size: '1.4 MB' }
    ]
  },
  {
    id: 'emp-5',
    employeeId: 'DF-1005',
    name: 'Kenji Takahashi',
    email: 'kenji.t@dayflow.com',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    address: '325 Townsend St, San Francisco, CA 94107',
    dob: '1990-03-18',
    department: 'Engineering',
    jobTitle: 'Principal Backend Architect',
    joiningDate: '2020-08-15',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 8900,
      hra: 3560,
      allowances: 2100,
      deductions: 1400,
    },
    documents: [
      { id: 'doc-501', name: 'Offer_Letter_Kenji.pdf', type: 'Offer Letter', uploadedAt: '2020-08-01', size: '1.3 MB' }
    ]
  },
  {
    id: 'emp-6',
    employeeId: 'DF-1006',
    name: 'Priya Sharma',
    email: 'priya.s@dayflow.com',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    address: '1500 4th Street, San Francisco, CA 94158',
    dob: '1995-12-04',
    department: 'Engineering',
    jobTitle: 'Fullstack Software Engineer',
    joiningDate: '2023-01-09',
    manager: 'Kenji Takahashi',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 6000,
      hra: 2400,
      allowances: 1300,
      deductions: 880,
    },
    documents: [
      { id: 'doc-601', name: 'Offer_Letter_Priya.pdf', type: 'Offer Letter', uploadedAt: '2022-12-20', size: '1.2 MB' }
    ]
  },
  {
    id: 'emp-7',
    employeeId: 'DF-1007',
    name: 'Liam O’Connor',
    email: 'liam.o@dayflow.com',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    address: '220 Folsom St, San Francisco, CA 94105',
    dob: '1991-07-30',
    department: 'Finance',
    jobTitle: 'Senior Financial Analyst',
    joiningDate: '2021-11-15',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 6800,
      hra: 2720,
      allowances: 1500,
      deductions: 980,
    },
    documents: [
      { id: 'doc-701', name: 'Offer_Letter_Liam.pdf', type: 'Offer Letter', uploadedAt: '2021-11-01', size: '1.2 MB' }
    ]
  },
  {
    id: 'emp-8',
    employeeId: 'DF-1008',
    name: 'Amara Okafor',
    email: 'amara.o@dayflow.com',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    address: '600 Harrison St, San Francisco, CA 94107',
    dob: '1996-02-14',
    department: 'Marketing',
    jobTitle: 'Growth & Brand Marketing Lead',
    joiningDate: '2022-07-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 6400,
      hra: 2560,
      allowances: 1450,
      deductions: 920,
    },
    documents: [
      { id: 'doc-801', name: 'Offer_Letter_Amara.pdf', type: 'Offer Letter', uploadedAt: '2022-06-15', size: '1.3 MB' }
    ]
  },
  {
    id: 'emp-9',
    employeeId: 'DF-1009',
    name: 'David Kim',
    email: 'david.k@dayflow.com',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    address: '900 Bush St, San Francisco, CA 94109',
    dob: '1993-10-08',
    department: 'Sales',
    jobTitle: 'Enterprise Account Executive',
    joiningDate: '2022-04-18',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 5500,
      hra: 2200,
      allowances: 3000,
      deductions: 1100,
    },
    documents: [
      { id: 'doc-901', name: 'Offer_Letter_David.pdf', type: 'Offer Letter', uploadedAt: '2022-04-01', size: '1.2 MB' }
    ]
  },
  {
    id: 'emp-10',
    employeeId: 'DF-1010',
    name: 'Sophia Benitez',
    email: 'sophia.b@dayflow.com',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    address: '1100 Chestnut St, San Francisco, CA 94109',
    dob: '1997-05-22',
    department: 'Design',
    jobTitle: 'UI/UX Visual Designer',
    joiningDate: '2023-04-01',
    manager: 'Elena Rostova',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 5200,
      hra: 2080,
      allowances: 1100,
      deductions: 750,
    },
    documents: [
      { id: 'doc-1001', name: 'Offer_Letter_Sophia.pdf', type: 'Offer Letter', uploadedAt: '2023-03-20', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-11',
    employeeId: 'DF-1011',
    name: 'Julian Alvarez',
    email: 'julian.a@dayflow.com',
    phone: '+1 (555) 123-4560',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    address: '380 Brannan St, San Francisco, CA 94107',
    dob: '1995-09-17',
    department: 'Engineering',
    jobTitle: 'DevOps & Cloud Engineer',
    joiningDate: '2023-08-15',
    manager: 'Kenji Takahashi',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 6200,
      hra: 2480,
      allowances: 1350,
      deductions: 900,
    },
    documents: [
      { id: 'doc-1101', name: 'Offer_Letter_Julian.pdf', type: 'Offer Letter', uploadedAt: '2023-08-01', size: '1.2 MB' }
    ]
  },
  {
    id: 'emp-12',
    employeeId: 'DF-1012',
    name: 'Rachel Green',
    email: 'rachel.g@dayflow.com',
    phone: '+1 (555) 234-5671',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    address: '555 California St, San Francisco, CA 94104',
    dob: '1998-01-19',
    department: 'Marketing',
    jobTitle: 'Content & Social Media Strategist',
    joiningDate: '2024-02-01',
    manager: 'Amara Okafor',
    employmentType: 'Full-Time',
    status: 'Probation',
    role: 'Employee',
    salary: {
      basic: 4500,
      hra: 1800,
      allowances: 950,
      deductions: 620,
    },
    documents: [
      { id: 'doc-1201', name: 'Offer_Letter_Rachel.pdf', type: 'Offer Letter', uploadedAt: '2024-01-15', size: '1.0 MB' }
    ]
  },
  {
    id: 'emp-13',
    employeeId: 'DF-1013',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.m@dayflow.com',
    phone: '+1 (555) 345-6782',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    address: '750 Post St, San Francisco, CA 94109',
    dob: '1989-12-10',
    department: 'Finance',
    jobTitle: 'Head of Financial Planning',
    joiningDate: '2020-04-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 8500,
      hra: 3400,
      allowances: 2000,
      deductions: 1350,
    },
    documents: [
      { id: 'doc-1301', name: 'Offer_Letter_Tariq.pdf', type: 'Offer Letter', uploadedAt: '2020-03-15', size: '1.5 MB' }
    ]
  },
  {
    id: 'emp-14',
    employeeId: 'DF-1014',
    name: 'Chloe Dubois',
    email: 'chloe.d@dayflow.com',
    phone: '+1 (555) 456-7893',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    address: '420 8th St, San Francisco, CA 94103',
    dob: '1996-08-30',
    department: 'Design',
    jobTitle: 'Product Design Researcher',
    joiningDate: '2023-11-01',
    manager: 'Elena Rostova',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 5400,
      hra: 2160,
      allowances: 1150,
      deductions: 780,
    },
    documents: [
      { id: 'doc-1401', name: 'Offer_Letter_Chloe.pdf', type: 'Offer Letter', uploadedAt: '2023-10-15', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-15',
    employeeId: 'DF-1015',
    name: 'Lucas Silva',
    email: 'lucas.s@dayflow.com',
    phone: '+1 (555) 567-8904',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    address: '1400 Valencia St, San Francisco, CA 94110',
    dob: '1992-07-04',
    department: 'Sales',
    jobTitle: 'Senior Sales Director',
    joiningDate: '2021-03-01',
    manager: 'Sarah Jenkins',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 7800,
      hra: 3120,
      allowances: 3500,
      deductions: 1550,
    },
    documents: [
      { id: 'doc-1501', name: 'Offer_Letter_Lucas.pdf', type: 'Offer Letter', uploadedAt: '2021-02-15', size: '1.3 MB' }
    ]
  },
  {
    id: 'emp-16',
    employeeId: 'DF-1016',
    name: 'Zoe Kravitz',
    email: 'zoe.k@dayflow.com',
    phone: '+1 (555) 678-9015',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    address: '2100 Polk St, San Francisco, CA 94109',
    dob: '1997-11-12',
    department: 'HR',
    jobTitle: 'Talent Acquisition Partner',
    joiningDate: '2023-06-15',
    manager: 'Marcus Vance',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 4900,
      hra: 1960,
      allowances: 1000,
      deductions: 710,
    },
    documents: [
      { id: 'doc-1601', name: 'Offer_Letter_Zoe.pdf', type: 'Offer Letter', uploadedAt: '2023-06-01', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-17',
    employeeId: 'DF-1017',
    name: 'Ethan Hunt',
    email: 'ethan.h@dayflow.com',
    phone: '+1 (555) 789-0126',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    address: '890 Howard St, San Francisco, CA 94103',
    dob: '1991-03-22',
    department: 'Engineering',
    jobTitle: 'QA Automation Lead',
    joiningDate: '2022-10-10',
    manager: 'Kenji Takahashi',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 5900,
      hra: 2360,
      allowances: 1250,
      deductions: 860,
    },
    documents: [
      { id: 'doc-1701', name: 'Offer_Letter_Ethan.pdf', type: 'Offer Letter', uploadedAt: '2022-09-25', size: '1.2 MB' }
    ]
  },
  {
    id: 'emp-18',
    employeeId: 'DF-1018',
    name: 'Mei Ling Zhou',
    email: 'mei.z@dayflow.com',
    phone: '+1 (555) 890-1237',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    address: '1600 Stockton St, San Francisco, CA 94133',
    dob: '1994-04-05',
    department: 'Finance',
    jobTitle: 'Payroll & Tax Specialist',
    joiningDate: '2023-03-01',
    manager: 'Tariq Al-Mansoor',
    employmentType: 'Full-Time',
    status: 'Active',
    role: 'Employee',
    salary: {
      basic: 5100,
      hra: 2040,
      allowances: 1050,
      deductions: 730,
    },
    documents: [
      { id: 'doc-1801', name: 'Offer_Letter_Mei.pdf', type: 'Offer Letter', uploadedAt: '2023-02-15', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-19',
    employeeId: 'DF-1019',
    name: 'Noah Bennett',
    email: 'noah.b@dayflow.com',
    phone: '+1 (555) 901-2348',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    address: '300 Beale St, San Francisco, CA 94105',
    dob: '1999-08-14',
    department: 'Engineering',
    jobTitle: 'Junior Frontend Developer',
    joiningDate: '2024-05-01',
    manager: 'Alex Morgan',
    employmentType: 'Full-Time',
    status: 'Probation',
    role: 'Employee',
    salary: {
      basic: 4200,
      hra: 1680,
      allowances: 800,
      deductions: 580,
    },
    documents: [
      { id: 'doc-1901', name: 'Offer_Letter_Noah.pdf', type: 'Offer Letter', uploadedAt: '2024-04-20', size: '1.0 MB' }
    ]
  },
  {
    id: 'emp-20',
    employeeId: 'DF-1020',
    name: 'Isabella Rossi',
    email: 'isabella.r@dayflow.com',
    phone: '+1 (555) 012-3459',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
    address: '650 Columbus Ave, San Francisco, CA 94133',
    dob: '1993-01-28',
    department: 'Sales',
    jobTitle: 'Business Development Manager',
    joiningDate: '2022-09-01',
    manager: 'Lucas Silva',
    employmentType: 'Full-Time',
    status: 'On Leave',
    role: 'Employee',
    salary: {
      basic: 5600,
      hra: 2240,
      allowances: 1800,
      deductions: 890,
    },
    documents: [
      { id: 'doc-2001', name: 'Offer_Letter_Isabella.pdf', type: 'Offer Letter', uploadedAt: '2022-08-15', size: '1.2 MB' }
    ]
  }
];
