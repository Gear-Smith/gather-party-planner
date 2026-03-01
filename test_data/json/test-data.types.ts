export const LOCATION_RATING_LABELS = {
  1: "*",
  2: "**",
  3: "***",
  4: "****",
  5: "*****",
} as const;

export const LOCATION_TONE_LABELS = {
  1: "Casual",
  2: "Clean",
  3: "Khakis",
  4: "Smart",
  5: "Classy",
} as const;

export const LOCATION_EXPOSURE_LABELS = {
  1: "Private",
  2: "Low Profile",
  3: "Public",
  4: "Visible",
  5: "Spotlight",
} as const;

export const LOCATION_MORALITY_LABELS = {
  1: "G",
  2: "PG",
  3: "PG-13",
  4: "R",
  5: "NC-17",
} as const;

export const LOCATION_BUDGET_LABELS = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
  5: "$$$$$",
} as const;

export type LocationRating = 1 | 2 | 3 | 4 | 5;
export type LocationTone = 1 | 2 | 3 | 4 | 5;
export type LocationExposure = 1 | 2 | 3 | 4 | 5;
export type LocationMorality = 1 | 2 | 3 | 4 | 5;
export type LocationBudget = 1 | 2 | 3 | 4 | 5;

export const LOCATION_TYPE_VALUES = [
  "Hotel",
  "Restaurant",
  "Bar",
  "Strip Club",
  "Speakeasy",
  "Event Venue",
  "Arena",
  "Park",
  "Spa",
  "Grocery",
  "Liquor Store",
  "Museum",
  "Transit",
  "Pharmacy",
  "Medical",
  "Club",
  "Comedy",
  "Activity",
  "Tour",
  "Food",
  "Outdoor",
  "Coffee",
  "Experience",
  "Cigar Lounge",
  "Cigar Vendor",
] as const;

export const USER_ROLE_VALUES = [
  "Party Planner",
  "Party Goer",
  "Co-Planner",
] as const;

export const USER_STATUS_VALUES = [
  "active",
] as const;

export const PARTY_TYPE_VALUES = [
  "Celebration",
] as const;

export const PARTY_STATUS_VALUES = [
  "Pre-Party",
] as const;

export interface LocationRecord {
  location_id: string;
  location_type: (typeof LOCATION_TYPE_VALUES)[number];
  location_city: string | null;
  location_name: string | null;
  location_rating: LocationRating | null;
  location_address: string | null;
  location_hours: string | null;
  location_phone: string | null;
  location_website: string | null;
  location_pictures: string | null;
  location_tone: LocationTone | null;
  location_exposure: LocationExposure | null;
  location_morality: LocationMorality | null;
  location_budget: LocationBudget | null;
}

export interface UserRecord {
  user_id: string;
  user_created: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_display_name: string | null;
  user_role: (typeof USER_ROLE_VALUES)[number] | null;
  user_phone: string | null;
  user_email: string | null;
  user_last_active: string | null;
  user_status: (typeof USER_STATUS_VALUES)[number] | null;
}

export interface PartyRecord {
  party_id: string;
  party_creator: string | null;
  party_created_at: string | null;
  party_updated_at: string | null;
  party_name: string | null;
  party_type: (typeof PARTY_TYPE_VALUES)[number] | null;
  party_status: (typeof PARTY_STATUS_VALUES)[number] | null;
  party_start: string | null;
  party_end: string | null;
  party_location: string | null;
  party_headcount: number | null;
  party_tone: LocationTone | null;
  party_exposure: LocationExposure | null;
  party_morality: LocationMorality | null;
  party_budget: LocationBudget | null;
  party_planner: string | null;
  party_share_code: string | null;
}

export interface ItineraryRecord {
  itin_id: string;
  party_id: string | null;
  itin_title: string | null;
  itin_start: string | null;
  itin_end: string | null;
  itin_location: string | null;
  itin_roster: string | null;
}

