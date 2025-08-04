import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    calcom_url?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export interface Candidate {
    id: number;
    name: string;
    phone: string;
    email?: string;
    website?: string;
    city?: string;
    state?: string;
    country?: string;
    company_name?: string;
    current_designation?: string;
    experience?: string;
    notice_period?: string;
    designations?: Array<{
        title: string;
        company?: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        is_current?: boolean;
    }>;
    status?: 'interested' | 'not_interested' | 'dnd' | 'followup';
    current_ctc?: number;
    expected_ctc?: number;
    resume?: string;
    owner: { id: number; name: string };
    created_at: string;
    updated_at: string;
    last_activity_at?: string;
    deals: Deal[];
    activities: Activity[];
    notes: Note[];
    documents: Document[];
    positions?: Position[];
}

export interface Deal {
    id: number;
    candidate_id: number;
    brand_id: number;
    position_id: number;
    hr_id?: number;
    pipeline_id: number;
    stage_id: number;
    created_at: string;
    updated_at: string;
    brand?: Brand;
    position?: Position;
    hr?: Hr;
    pipeline?: Pipeline;
    stage?: Stage;
}

export interface Activity {
    id: number;
    candidate_id: number;
    type: string;
    description: string;
    created_at: string;
    scheduled_at: string;
    updated_at: string;
    is_completed: boolean;
}

export interface Note {
    id: number;
    candidate_id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    candidate_id: number;
    path: string;
    name: string;
    type: 'general' | 'personal';
    document_type?: string;
    created_at: string;
    updated_at: string;
}

export interface Pipeline {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    created_at: string;
    updated_at: string;
}

export interface Brand {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Position {
    id: number;
    title: string;
    brand_id: number;
    hr_id: number;
    created_at: string;
    updated_at: string;
}

export interface Hr {
    id: number;
    name: string;
    email: string;
    brand_id: number;
    created_at: string;
    updated_at: string;
}