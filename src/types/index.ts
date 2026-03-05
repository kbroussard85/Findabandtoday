export interface MediaItem {
  url: string;
  type: string;
  name?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  audioUrlPreview?: string | null;
  media?: MediaItem[] | null;
  backlineInfo?: string | null;
  negotiationPrefs?: {
    minRate?: number;
    openToNegotiate?: boolean;
  } | null;
}
