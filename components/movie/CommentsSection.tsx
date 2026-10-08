"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, MessageCircle, CornerDownRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Comment, UserProfile } from "@/types";

interface CommentsSectionProps {
  movieId: string;
}

interface CommentWithReplies extends Comment {
  user?: UserProfile;
  replies?: CommentWithReplies[];
}

// Auth olib tashlandi — izohlar faqat ko'rsatiladi, yozib bo'lmaydi
export default function CommentsSection({ movieId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);

  const supabase = createClient();

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        id, content, created_at, updated_at, parent_id, user_id, is_approved,
        user:profiles(id, username, avatar_url)
      `)
      .eq("movie_id", movieId)
      .eq("is_approved", true)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!data) return;

    const withReplies = await Promise.all(
      (data as unknown as CommentWithReplies[]).map(async (c) => {
        const { data: replies } = await supabase
          .from("comments")
          .select(`id, content, created_at, user_id, parent_id, is_approved, user:profiles(id, username, avatar_url)`)
          .eq("movie_id", movieId)
          .eq("parent_id", c.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: true });
        return { ...c, replies: (replies as unknown as CommentWithReplies[]) || [] };
      })
    );

    setComments(withReplies);
  }, [movieId, supabase]);

  useEffect(() => {
    loadComments();

    const channel = supabase
      .channel(`comments:${movieId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `movie_id=eq.${movieId}`,
      }, () => loadComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [movieId, loadComments]);

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span
          className="text-vhs text-[0.55rem] tracking-widest px-2 py-1"
          style={{ color: "#764838", border: "1px solid rgba(0,0,0,0.12)" }}
        >
          COMMENTS
        </span>
        <h2 className="text-vhs tracking-wider text-sm" style={{ color: "#764838" }}>
          IZOHLAR
        </h2>
        <span className="text-vhs text-[0.55rem]" style={{ color: "#764838" }}>
          ({totalCount})
        </span>
      </div>

      {/* Izohlar ro'yxati */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={24} className="mx-auto mb-2" style={{ color: "#764838" }} />
            <p className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#764838" }}>
              HALI IZOH YO&apos;Q
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: CommentWithReplies }) {
  const author = (comment.user as any)?.username || "Anonim";

  return (
    <div className="space-y-3">
      <div
        className="flex gap-3 p-4"
        style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ border: "1px solid rgba(0,0,0,0.15)", background: "#DDD0A5" }}
        >
          <span className="text-vhs text-[0.55rem]" style={{ color: "#764838" }}>
            {author[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-vhs text-[0.6rem] tracking-wider" style={{ color: "#764838" }}>
              {author}
            </span>
            <span className="text-[0.6rem]" style={{ color: "#764838" }}>
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-[0.8rem] leading-relaxed" style={{ color: "#764838" }}>
            {comment.content}
          </p>
        </div>
      </div>

      {/* Javoblar */}
      {comment.replies?.map((reply) => (
        <div
          key={reply.id}
          className="ml-8 flex gap-3 p-3"
          style={{ background: "#EAE0C6", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: "1px solid rgba(0,0,0,0.12)", background: "#DDD0A5" }}
          >
            <span className="text-vhs text-[0.5rem]" style={{ color: "#764838" }}>
              {((reply.user as any)?.username || "A")[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-vhs text-[0.55rem]" style={{ color: "#764838" }}>
                {(reply.user as any)?.username || "Anonim"}
              </span>
              <span className="text-[0.55rem]" style={{ color: "#764838" }}>
                {formatDate(reply.created_at)}
              </span>
            </div>
            <p className="text-[0.75rem]" style={{ color: "#764838" }}>
              {reply.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
