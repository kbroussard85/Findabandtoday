export interface MediaItem {
  url: string;
  type: string;
  name?: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  audioUrlPreview?: string | null;
  media?: MediaItem[] | null;
  backlineInfo?: string | null;
  genres?: Genre[] | null;
  average_rating?: number;
  negotiationPrefs?: {
    minRate?: number;
    openToNegotiate?: boolean;
  } | null;
}
