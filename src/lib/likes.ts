export const LIKE_VISITOR_COOKIE = "like_visitor_id";
export const LIKE_VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type DeviceType = "bot" | "desktop" | "mobile" | "tablet" | "unknown";

export type LikeEntry = {
  visitorId: string;
  country: string;
  city: string;
  latitude: string;
  longitude: string;
  postalCode: string;
  timezone: string;
  userAgent: string;
  os: string;
  deviceType: DeviceType;
  likedAt: string;
};

export type LikeMutationRequest = {
  slug: string;
};

export type LikeResponse = {
  postId: string;
  likes: number;
  liked: boolean;
};
