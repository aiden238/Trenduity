/**
 * 가족 관련 타입 정의
 */

export interface FamilyMember {
  user_id: string;
  name: string;
  last_activity: string | null;
  perms: {
    read: boolean;
    alerts: boolean;
  };
}

export interface FamilyMembersResponse {
  members: FamilyMember[];
}

export interface MemberProfile {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  total_points: number;
  badges: string[];
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  cards_completed: number;
  med_checks: number;
}

export interface MemberActivity {
  daily_activities: DailyActivity[];
  total_cards_7days: number;
  total_med_checks_7days: number;
}
