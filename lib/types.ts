export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  email?: string;
  created_at?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string | null;
  likes: number;
  dislikes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
  created_at?: string;
}

export interface UserProfile extends User {
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
}

export interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
}