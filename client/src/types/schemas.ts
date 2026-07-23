import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const cardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(2000, 'Description must be under 2000 characters').nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  dueDate: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['Admin', 'HR', 'Employee']),
  departmentId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

export const boardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
  departmentId: z.string().min(1, 'Department is required'),
});

export type BoardFormData = z.infer<typeof boardSchema>;

export const columnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(50),
  order: z.number().optional(),
});

export type ColumnFormData = z.infer<typeof columnSchema>;

export const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(200),
  bodyHtml: z.string().min(1, 'Body HTML is required'),
  placeholderSchema: z.record(z.string(), z.string()).optional(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

export const sendEmailSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  toUserId: z.string().min(1, 'Recipient is required'),
  placeholders: z.record(z.string(), z.string()).optional(),
});

export type SendEmailFormData = z.infer<typeof sendEmailSchema>;
