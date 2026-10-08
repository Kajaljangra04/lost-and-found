export type lostItem = {
  id: string;
  img: string;
  userId: string;
  categoryId: string;
  lostItemName: string;
  description: string;
  date: string;
  location: string;
  createdAt: Date;
  isFound: boolean;
  updatedAt: Date;
};

export type modals = {
  message: string;
  status: boolean;
};

export type decodedUser = {
  role: Role;
  id: string;
  email: string;
  name?: string;
  username?: string;
  userImg?: string;
  iat?: number;
  exp?: number;
};

export type Role = "ADMIN" | "USER";

export type ItemCategory = { id: string; name: string };

export type FoundItem = {
  id: string;
  img?: string;
  foundItemName: string;
  description?: string;
  location?: string;
  date?: string;
  createdAt?: string;
  isClaimed?: boolean;
  category?: ItemCategory | null;
  user?: { username?: string };
};

export type LostItem = {
  id: string;
  img?: string;
  lostItemName: string;
  description?: string;
  location?: string;
  date?: string;
  createdAt?: string;
  isFound?: boolean;
  category?: ItemCategory | null;
  user?: { username?: string };
};

export type Claim = {
  id: string;
  status: string;
  createdAt?: string;
  lostDate?: string;
  distinguishingFeatures?: string;
  foundItem?: FoundItem;
};

export type RecentActivity = {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp?: string;
  time?: string;
};