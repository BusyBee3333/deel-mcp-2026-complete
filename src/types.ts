// ─── Deel API Types ───────────────────────────────────────────────────────────

export interface DeelConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  per_page?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
  };
}

// ─── Contract Types ───────────────────────────────────────────────────────────

export type ContractStatus =
  | "pending"
  | "active"
  | "terminated"
  | "completed"
  | "paused";

export type ContractType =
  | "eor"
  | "contractor"
  | "employee"
  | "pay_as_you_go"
  | "fixed";

export interface Contract {
  id: string;
  title: string;
  status: ContractStatus;
  type: ContractType;
  client?: { id: string; name: string };
  worker?: { id: string; name: string; email: string };
  start_date?: string;
  end_date?: string;
  country?: string;
  currency?: string;
  amount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContractPayload {
  type: ContractType;
  title: string;
  worker_id?: string;
  worker_email?: string;
  country: string;
  currency: string;
  amount?: number;
  start_date: string;
  end_date?: string;
  job_title?: string;
  scope_of_work?: string;
}

// ─── Worker Types ─────────────────────────────────────────────────────────────

export type WorkerStatus = "active" | "pending" | "invited" | "offboarded";

export interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: WorkerStatus;
  country?: string;
  job_title?: string;
  department?: string;
  contracts?: Contract[];
  created_at: string;
  updated_at: string;
}

export interface InviteWorkerPayload {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  job_title?: string;
  department_id?: string;
  contract_id?: string;
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface Payment {
  id: string;
  contract_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  is_default: boolean;
  last_four?: string;
  currency?: string;
}

// ─── Invoice Types ────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "pending"
  | "approved"
  | "declined"
  | "paid"
  | "overdue";

export interface Invoice {
  id: string;
  contract_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date?: string;
  period_start?: string;
  period_end?: string;
  line_items?: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceAdjustment {
  id: string;
  invoice_id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

// ─── Document Types ───────────────────────────────────────────────────────────

export type DocumentStatus = "pending" | "signed" | "expired" | "declined";

export interface Document {
  id: string;
  title: string;
  type: string;
  status: DocumentStatus;
  contract_id?: string;
  worker_id?: string;
  url?: string;
  signed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ─── Off-Cycle Payment Types ──────────────────────────────────────────────────

export type OffCyclePaymentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "processing"
  | "completed"
  | "declined";

export interface OffCyclePayment {
  id: string;
  contract_id: string;
  amount: number;
  currency: string;
  status: OffCyclePaymentStatus;
  reason: string;
  description?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

// ─── Time Off Types ───────────────────────────────────────────────────────────

export type TimeOffRequestStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled";

export interface TimeOffPolicy {
  id: string;
  name: string;
  type: string;
  accrual_type?: string;
  days_per_year?: number;
  country?: string;
  created_at: string;
}

export interface TimeOffRequest {
  id: string;
  worker_id: string;
  policy_id: string;
  status: TimeOffRequestStatus;
  start_date: string;
  end_date: string;
  days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Expense Types ────────────────────────────────────────────────────────────

export type ExpenseStatus =
  | "draft"
  | "pending"
  | "approved"
  | "declined"
  | "paid";

export interface Expense {
  id: string;
  contract_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: ExpenseStatus;
  receipt_url?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

// ─── Organization Types ───────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  country?: string;
  website?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string;
  country: string;
  registration_number?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── Compliance Types ─────────────────────────────────────────────────────────

export interface ComplianceItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  country?: string;
  due_date?: string;
  worker_id?: string;
  contract_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceStatus {
  overall_status: string;
  items: ComplianceItem[];
  summary: {
    total: number;
    compliant: number;
    non_compliant: number;
    pending: number;
  };
}

export interface RequiredDocument {
  id: string;
  type: string;
  name: string;
  description?: string;
  country: string;
  required_by?: string;
  is_submitted: boolean;
  submitted_at?: string;
}
