"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface MovieAdminActionsProps {
  movieId:    string;
  slug:       string;
  isPublished: boolean;
  baseUrl?:   string; // "/retrokino-admin" yoki "/admin"
}

export default function MovieAdminActions({
  movieId,
  slug,
  isPublished,
  baseUrl = "/retrokino-admin",
}: MovieAdminActionsProps) {
  const [published,  setPublished]  = useState(isPublished);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const router   = useRouter();

  const togglePublish = async () => {
    const newVal = !published;
    const { error } = await supabase
      .from("movies")
      .update({ is_published: newVal })
      .eq("id", movieId);
    if (!error) {
      setPublished(newVal);
      toast.success(newVal ? "Nashr qilindi" : "Yashirildi");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu filmni o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi!")) return;
    setIsDeleting(true);
    const { error } = await supabase.from("movies").delete().eq("id", movieId);
    if (!error) {
      toast.success("Film o'chirildi");
      router.refresh();
    } else {
      toast.error("O'chirishda xatolik");
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Ko'rinish toggle */}
      <button
        onClick={togglePublish}
        className="p-1.5 rounded transition-colors"
        style={{ color: "#764838" }}
        title={published ? "Yashirish" : "Nashr qilish"}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
      >
        {published ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>

      {/* O'chirish */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 rounded transition-colors disabled:opacity-40"
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
  );
}
