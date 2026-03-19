export interface Account {
  id: string;
  username: string;
  discord?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  created_at: number;
  updated_at: number;
}
