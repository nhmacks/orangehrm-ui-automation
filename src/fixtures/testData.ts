export interface User {
  username: string;
  password: string;
  role: 'Admin' | 'ESS' | 'Supervisor';
  firstName?: string;
  lastName?: string;
}

export interface Employee {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId?: string;
  photograph?: string;
}

export const VALID_USERS: Record<string, User> = {
  admin: {
    username: 'Admin',
    password: 'admin123',
    role: 'Admin',
    firstName: 'Admin',
  },
  ess: {
    username: 'ESS',
    password: 'ess123',
    role: 'ESS',
    firstName: 'Employee',
  },
  supervisor: {
    username: 'Supervisor',
    password: 'supervisor123',
    role: 'Supervisor',
    firstName: 'Supervisor',
  },
};

export const INVALID_USERS: Record<string, Partial<User>> = {
  invalidUsername: {
    username: 'InvalidUser',
    password: 'admin123',
  },
  invalidPassword: {
    username: 'Admin',
    password: 'wrongpassword',
  },
  emptyUsername: {
    username: '',
    password: 'admin123',
  },
  emptyPassword: {
    username: 'Admin',
    password: '',
  },
};

export const SAMPLE_EMPLOYEES: Employee[] = [
  {
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    employeeId: 'EMP001',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    employeeId: 'EMP002',
  },
  {
    firstName: 'Robert',
    middleName: 'James',
    lastName: 'Johnson',
    employeeId: 'EMP003',
  },
];

export const MODULES = [
  'Admin',
  'PIM',
  'Leave',
  'Time',
  'Recruitment',
  'My Info',
  'Performance',
  'Dashboard',
  'Directory',
  'Maintenance',
  'Claim',
  'Buzz',
] as const;

export type ModuleName = typeof MODULES[number];

export const ERROR_MESSAGES = {
  invalidCredentials: 'Invalid credentials',
  required: 'Required',
  accountDisabled: 'Account disabled',
  accountLocked: 'Account locked',
  sessionExpired: 'Session expired',
} as const;

export const VALIDATION_MESSAGES = {
  usernameRequired: 'Username cannot be empty',
  passwordRequired: 'Password cannot be empty',
  invalidEmail: 'Expected format: admin@example.com',
  passwordLength: 'Should have at least 8 characters',
} as const;

export default {
  VALID_USERS,
  INVALID_USERS,
  SAMPLE_EMPLOYEES,
  MODULES,
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
};
