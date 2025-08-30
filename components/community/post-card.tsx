// components/community/post-card.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  MessageCircle,
  Heart,
  Globe,
  Share2,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/types";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface PostCardProps {
  post: CommunityPost;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const sb = getSupabaseClient();

  const renderMedia = (media_urls?: string[], media_type?: string) => {
    console.log('renderMedia called with:', { media_urls, media_type });
    if (!media_urls || media_urls.length === 0) return null;

    const isVideo = (type?: string, url?: string) => type?.startsWith('video') || /\.(mp4|webm|ogg)$/i.test(url || '');

    return (
      <Carousel className="w-full max-w-full relative group mb-3">
        <CarouselContent className="-ml-2 md:-ml-4">
          {media_urls.map((url, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {isVideo(media_type, url) ? (
                  <video src={url} controls className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Failed to load image:', url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {media_urls.length > 3 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-2 transform opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-2 transform opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </Carousel>
    );
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to like posts.");
      return;
    }

    if (!sb) return;

    try {
      const { data, error } = await sb
        .from('post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error checking like status:", error);
        toast.error("Failed to check like status.");
        return;
      }

      if (data && data.length > 0) {
        // Unlike
        const { error: unlikeError } = await sb
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (unlikeError) {
          console.error("Error unliking post:", unlikeError);
          toast.error("Failed to unlike post.");
          return;
        }
        onPostUpdated?.(); // Notify parent component to refresh
        toast.success("Post unliked!");
      } else {
        // Like
        const { error: likeError } = await sb
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (likeError) {
          console.error("Error liking post:", likeError);
          toast.error("Failed to like post.");
          return;
        }
        onPostUpdated?.(); // Notify parent component to refresh
        toast.success("Post liked!");
      }
    } catch (error) {
      console.error("Error in handleLikePost:", error);
      toast.error("Failed to like post.");
    }
  };

  const handleSharePost = async (post: CommunityPost) => {
    if (!user) {
      toast.error("Please log in to share posts.");
      return;
    }

    if (!sb) return;

    try {
      // First, attempt to use the Web Share API
      if (navigator.share) {
        await navigator.share({
          title: post.content.substring(0, 50) + '...',
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`,
        });
        toast.success("Post shared!");
      } else {
        // Fallback for browsers that do not support Web Share API
        const postLink = `${window.location.origin}/posts/${post.id}`;
        await navigator.clipboard.writeText(postLink);
        toast.info("Post link copied to clipboard!");
      }

      const { error } = await sb
        .from('post_shares')
        .insert({ post_id: post.id, user_id: user.id });

      if (error) {
        console.error("Error logging share in DB:", error);
        // Don't toast error here, as the share might have succeeded via Web Share API/clipboard
      }
      onPostUpdated?.(); // Notify parent component to refresh
    } catch (error) {
      console.error("Error in handleSharePost:", error);
      if (error instanceof DOMException && error.name === "AbortError") {
        // User cancelled the share operation, do nothing
        console.log("Share cancelled by user.");
      } else {
        toast.error("Failed to share post.");
      }
    }
  };

  return (
    <Card
      key={post.id}
      className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => {
        console.log('Navigating to post:', post.id);
        router.push(`/posts/${post.id}`);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
            <AvatarImage src={post.author_avatar || undefined} />
            <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{post.author_name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              {post.community?.name && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    {post.community.name}
                </Badge>
                </>
              )}
              </div>
            {renderMedia(post.media_urls, post.media_type)}
            <p className="text-foreground mb-3">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleLikePost(post.id) }}
                className={`flex items-center gap-1 transition-colors ${post.user_has_liked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart className="w-4 h-4" />
                {post.like_count}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`) }}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comment_count}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSharePost(post) }}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
