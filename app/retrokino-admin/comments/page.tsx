"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Trash2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface CommentRow {
  id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  user: { username?: string; email?: string } | null;
  movie: { title_uz?: string; slug?: string } | null;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "pending" | "approved">("all");

  const supabase = useMemo(() => createClient(), []);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("comments")
      .select(`id, content, is_approved, created_at,
        user:profiles(username, email),
        movie:movies(title_uz, slug)`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter === "pending")  q = q.eq("is_approved", false);
    if (filter === "approved") q = q.eq("is_approved", true);

    const { data } = await q;
    setComments((data as unknown as CommentRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id: string) => {
    await supabase.from("comments").update({ is_approved: true }).eq("id", id);
    toast.success("Tasdiqlandi");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Izohni o'chirasizmi?")) return;
    await supabase.from("comments").delete().eq("id", id);
    toast.success("O'chirildi");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>IZOHLAR</h1>
        <div className="flex gap-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`badge-retro text-[0.55rem] cursor-pointer ${filter === f ? "active" : ""}`}
            >
              {f === "all" ? "Barchasi" : f === "pending" ? "Kutayotgan" : "Tasdiqlangan"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map((i) => <div key={i} className="shimmer h-14 rounded" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle size={28} className="mx-auto mb-3" style={{ color: "#764838", opacity: 0.3 }} />
          <p className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#764838", opacity: 0.4 }}>
            IZOH YO'Q
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {comments.map((c, idx) => (
            <div
              key={c.id}
              className="flex items-start gap-4 px-4 py-3.5"
              style={{
                background: idx % 2 === 0 ? "#EDE3CC" : "#EAE0C6",
                borderBottom: idx < comments.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-vhs text-[0.55rem] tracking-wider" style={{ color: "#764838" }}>
                    {(c.user as any)?.username || (c.user as any)?.email || "Anonim"}
                  </span>
                  <span className="text-[0.6rem]" style={{ color: "#764838", opacity: 0.5 }}>
                    → {(c.movie as any)?.title_uz || "Noma'lum film"}
                  </span>
                  {!c.is_approved && (
                    <span className="badge-retro text-[0.5rem]" style={{ color: "#E8341C" }}>Kutayotgan</span>
                  )}
                </div>
                <p className="text-[0.78rem] line-clamp-2" style={{ color: "#764838" }}>{c.content}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!c.is_approved && (
                  <button
                    onClick={() => approve(c.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "#764838" }}
                    title="Tasdiqlash"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#D9A441";
                      (e.currentTarget as HTMLElement).style.background = "rgba(217,164,65,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#764838";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <Check size={13} />
                  </button>
                )}
                <button
                  onClick={() => remove(c.id)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "#764838" }}
                  title="O'chirish"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#E8341C";
                    (e.currentTarget as HTMLElement).style.background = "rgba(232,52,28,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#764838";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
