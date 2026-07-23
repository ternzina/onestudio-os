export type PortfolioCategory = {
  id: string;
  name_uk: string;
  name_pl: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export type MediaLibraryItem = {
  id: string;
  image_url: string;
  r2_key: string;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_uk: string | null;
  alt_pl: string | null;
  is_active: boolean;
  is_favorite: boolean;
  manual_likes: number;
  source: string;
  created_at: string;
};

export type CategoryLink = {
  id: string;
  category_id: string;
  media_id: string;
  is_active: boolean;
  sort_order: number;
};

export type OrientationFilter = "all" | "portrait" | "landscape" | "square";
export type MediaTypeFilter = "all" | "images" | "videos";
export type ActiveMediaFilter = "all" | "visible" | "hidden" | "favorite" | "uncategorized";
