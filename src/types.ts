export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  owner_id: number;
  created_at: string;
  role?: 'owner' | 'editor' | 'viewer';
}

export interface Photo {
  id: number;
  name: string;
  url: string;
  folder_id: number | null;
  owner_id: number;
  size: number;
  created_at: string;
}

export interface Permission {
  id: number;
  user_id: number;
  target_id: number;
  target_type: 'folder' | 'photo';
  role: 'viewer' | 'editor';
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}
