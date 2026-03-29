export interface SocialFeedItem {
  id: string;
  platform: 'instagram' | 'tiktok';
  caption: string;
  permalink: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  timestamp: string;
}

export interface SocialFeed {
  instagram: SocialFeedItem[];
  tiktok: SocialFeedItem[];
}

export interface SocialPlatformSettings {
  username: string;
  profile_url: string;
  post_limit: number;
  account_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  access_token: string;
  refresh_token: string;
}

export interface SocialAdminSettings {
  instagram: SocialPlatformSettings;
  tiktok: SocialPlatformSettings;
}

export interface SocialPlatformStatus {
  configured: boolean;
  connected: boolean;
  username: string;
  item_count: number;
  last_sync_at: string;
  last_sync_error: string;
}

export interface SocialStatus {
  instagram: SocialPlatformStatus;
  tiktok: SocialPlatformStatus;
}
