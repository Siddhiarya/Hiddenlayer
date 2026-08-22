import { AttendanceRecord } from '../types/attendance';

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's records (assume 2026-10-14 for demo anchor or dynamically generated based on dates)
  {
    id: 'att-1',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: '09:12 AM',
    checkOut: null,
    workingHours: 4.5,
    status: 'Present',
    notes: 'Regular check-in'
  },
  {
    id: 'att-2',
    employeeId: 'DF-1002',
    employeeName: 'Sarah Jenkins',
    department: 'HR',
    date: '2026-10-14',
    checkIn: '08:45 AM',
    checkOut: null,
    workingHours: 5.0,
    status: 'Present'
  },
  {
    id: 'att-3',
    employeeId: 'DF-1003',
    employeeName: 'Marcus Vance',
    department: 'HR',
    date: '2026-10-14',
    checkIn: '09:00 AM',
    checkOut: null,
    workingHours: 4.7,
    status: 'Present'
  },
  {
    id: 'att-4',
    employeeId: 'DF-1004',
    employeeName: 'Elena Rostova',
    department: 'Design',
    date: '2026-10-14',
    checkIn: '09:30 AM',
    checkOut: null,
    workingHours: 4.2,
    status: 'Present'
  },
  {
    id: 'att-5',
    employeeId: 'DF-1005',
    employeeName: 'Kenji Takahashi',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: '08:50 AM',
    checkOut: null,
    workingHours: 4.9,
    status: 'Present'
  },
  {
    id: 'att-6',
    employeeId: 'DF-1006',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: '09:15 AM',
    checkOut: null,
    workingHours: 4.5,
    status: 'Present'
  },
  {
    id: 'att-7',
    employeeId: 'DF-1007',
    employeeName: 'Liam O’Connor',
    department: 'Finance',
    date: '2026-10-14',
    checkIn: '09:05 AM',
    checkOut: null,
    workingHours: 4.6,
    status: 'Present'
  },
  {
    id: 'att-8',
    employeeId: 'DF-1008',
    employeeName: 'Amara Okafor',
    department: 'Marketing',
    date: '2026-10-14',
    checkIn: '09:40 AM',
    checkOut: null,
    workingHours: 4.0,
    status: 'Present'
  },
  {
    id: 'att-9',
    employeeId: 'DF-1009',
    employeeName: 'David Kim',
    department: 'Sales',
    date: '2026-10-14',
    checkIn: '09:20 AM',
    checkOut: null,
    workingHours: 4.3,
    status: 'Present'
  },
  {
    id: 'att-10',
    employeeId: 'DF-1010',
    employeeName: 'Sophia Benitez',
    department: 'Design',
    date: '2026-10-14',
    checkIn: '10:00 AM',
    checkOut: null,
    workingHours: 3.7,
    status: 'Half Day',
    notes: 'Medical appointment in morning'
  },
  {
    id: 'att-11',
    employeeId: 'DF-1011',
    employeeName: 'Julian Alvarez',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: '08:30 AM',
    checkOut: null,
    workingHours: 5.2,
    status: 'Present'
  },
  {
    id: 'att-12',
    employeeId: 'DF-1012',
    employeeName: 'Rachel Green',
    department: 'Marketing',
    date: '2026-10-14',
    checkIn: '09:10 AM',
    checkOut: null,
    workingHours: 4.5,
    status: 'Present'
  },
  {
    id: 'att-13',
    employeeId: 'DF-1013',
    employeeName: 'Tariq Al-Mansoor',
    department: 'Finance',
    date: '2026-10-14',
    checkIn: '08:40 AM',
    checkOut: null,
    workingHours: 5.0,
    status: 'Present'
  },
  {
    id: 'att-14',
    employeeId: 'DF-1014',
    employeeName: 'Chloe Dubois',
    department: 'Design',
    date: '2026-10-14',
    checkIn: '09:25 AM',
    checkOut: null,
    workingHours: 4.3,
    status: 'Present'
  },
  {
    id: 'att-15',
    employeeId: 'DF-1015',
    employeeName: 'Lucas Silva',
    department: 'Sales',
    date: '2026-10-14',
    checkIn: '09:10 AM',
    checkOut: null,
    workingHours: 4.5,
    status: 'Present'
  },
  {
    id: 'att-16',
    employeeId: 'DF-1016',
    employeeName: 'Zoe Kravitz',
    department: 'HR',
    date: '2026-10-14',
    checkIn: '09:00 AM',
    checkOut: null,
    workingHours: 4.7,
    status: 'Present'
  },
  {
    id: 'att-17',
    employeeId: 'DF-1017',
    employeeName: 'Ethan Hunt',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: '09:05 AM',
    checkOut: null,
    workingHours: 4.6,
    status: 'Present'
  },
  {
    id: 'att-18',
    employeeId: 'DF-1018',
    employeeName: 'Mei Ling Zhou',
    department: 'Finance',
    date: '2026-10-14',
    checkIn: '08:55 AM',
    checkOut: null,
    workingHours: 4.8,
    status: 'Present'
  },
  {
    id: 'att-19',
    employeeId: 'DF-1019',
    employeeName: 'Noah Bennett',
    department: 'Engineering',
    date: '2026-10-14',
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'Absent',
    notes: 'Unplanned absence'
  },
  {
    id: 'att-20',
    employeeId: 'DF-1020',
    employeeName: 'Isabella Rossi',
    department: 'Sales',
    date: '2026-10-14',
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'Leave',
    notes: 'Approved Annual Vacation'
  },

  // Alex Morgan's past attendance records (for week/month view)
  {
    id: 'att-alex-1',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-13',
    checkIn: '09:05 AM',
    checkOut: '06:15 PM',
    workingHours: 8.5,
    status: 'Present'
  },
  {
    id: 'att-alex-2',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-12',
    checkIn: '08:55 AM',
    checkOut: '05:45 PM',
    workingHours: 8.3,
    status: 'Present'
  },
  {
    id: 'att-alex-3',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-11',
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'Absent',
    notes: 'Sunday - Weekend'
  },
  {
    id: 'att-alex-4',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-10',
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'Absent',
    notes: 'Saturday - Weekend'
  },
  {
    id: 'att-alex-5',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-09',
    checkIn: '09:30 AM',
    checkOut: '01:30 PM',
    workingHours: 4.0,
    status: 'Half Day',
    notes: 'Personal errand'
  },
  {
    id: 'att-alex-6',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-08',
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    workingHours: 8.0,
    status: 'Present'
  },
  {
    id: 'att-alex-7',
    employeeId: 'DF-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2026-10-07',
    checkIn: '09:10 AM',
    checkOut: '06:00 PM',
    workingHours: 8.2,
    status: 'Present'
  }
];
