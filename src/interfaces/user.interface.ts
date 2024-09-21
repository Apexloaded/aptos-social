export interface UserInterface {
  id: string;
  name?: string;
  username?: string;
  wallet?: string;
  email?: string;
  friends?: string[];
  is_verified?: boolean;
  bio?: string;
  banner?: string;
  pfp?: string;
  profile_uri?: string;
  updated_at?: string;
  created_at?: string;
  website?: string;
}

export interface INewUser {
  name: string;
  username: string;
  email: string;
  pfp: string;
}
