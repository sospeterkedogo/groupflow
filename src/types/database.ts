export type Group = {
  id: string;
  name: string;
  module_code: string | null;
  created_at: string;
};

export type Profile = {
  id: string; // matches auth.users UUID
  email: string | null;
  full_name: string | null;
  school_id: string | null;
  group_id: string | null;
  total_score: number;
  created_at: string;
};

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export type TaskCategory = 
  | 'Building' 
  | 'Structure' 
  | 'Design' 
  | 'Testing' 
  | 'Research' 
  | 'Helping' 
  | 'Writing' 
  | 'Systems' 
  | 'Ethics';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory; // NEW Field
  assignees: string[];
  group_id: string;
  is_coding_task: boolean; // Legacy
  due_date: string | null;
  created_at: string;
  artifacts?: any[];
};

export type Commit = {
  hash: string;
  message: string;
  lines_added: number;
  lines_deleted: number;
  author_email: string | null;
  task_id: string | null;
  impact_score: number;
  created_at: string;
};

export type Artifact = {
  id: string;
  task_id: string;
  file_url: string;
  uploaded_by: string | null;
  endorsements_count: number;
  created_at: string;
};
