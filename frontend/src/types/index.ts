export type UserRole = 'citizen' | 'official' | 'admin';
export type Department = 'Health' | 'Electricity' | 'Sanitation' | 'Water Works' | 'Infrastructure' | 'Public Works' | 'Transport';
export type ComplaintStatus = 'submitted' | 'ai_categorized' | 'routed' | 'in_progress' | 'resolved' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: Department;
  civic_points: number;
  created_at: string;
}

export interface ComplaintMedia {
  id: number;
  file_path: string;
  file_type: 'image' | 'video';
  file_name: string;
  created_at: string;
}

export interface ComplaintUpdate {
  id: number;
  message: string;
  status_changed_to?: ComplaintStatus;
  created_at: string;
  official: User;
}

export interface Complaint {
  id: number;
  complaint_number: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  department?: Department;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  ai_category?: string;
  ai_confidence?: number;
  rating?: number;
  rating_comment?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  user: User;
  media: ComplaintMedia[];
  updates: ComplaintUpdate[];
}

export interface ComplaintListItem {
  id: number;
  complaint_number: string;
  title: string;
  location: string;
  department?: Department;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  ai_category?: string;
  created_at: string;
  updated_at?: string;
  media: ComplaintMedia[];
}

export interface DashboardStats {
  pending_complaints: number;
  resolved_cases: number;
  avg_resolution_days: number;
  citizen_satisfaction: number;
  sla_compliance: number;
  total_citizens: number;
}

export interface IssueDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
