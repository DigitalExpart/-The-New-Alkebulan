import { PostWithStats } from "./social-feed";

export interface CommunityPost extends PostWithStats {
  community_id: string;
  community: {
    name: string;
    description: string;
    avatar_url: string;
  };
  media_urls?: string[];
  media_type?: string;
}
