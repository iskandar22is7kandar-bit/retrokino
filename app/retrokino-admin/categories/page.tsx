"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Category } from "@/types";

const CONTENT_TYPES = [
  { value: "film",    label: "Filmlar",     color: "#D9A441" },
  { value: "serial",  label: "Seriallar",   color: "#764838" },
  { value: "cartoon", label: "Multfilmlar", color: "#A07830" },
];

const SUBCATS = [
  { slug: "national", label: "Milliy" },
  { slug: "foreign",  label: "Xorijiy" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState("");
  const [showNew,    setShowNew]    = useState(false);
  const [newForm,    setNewForm]    = useState({ name_uz: "", name_ru: "", slug: "", type: "film" });

  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("type")
      .order("name_uz");
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newForm.name_uz || !newForm.slug) {
      toast.error("Nom va slug kerak");
      return;
    }
    const { error } = await supabase.from("categories").insert({
      name_uz: newForm.name_uz,
      name_ru: newForm.name_ru || newForm.name_uz,
      name_en: newForm.name_uz,
      slug:    newForm.slug.toLowerCase().replace(/\s+/g, "-"),
      type:    newForm.type,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Kategoriya qo'shildi");
    setShowNew(false);
    setNewForm({ name_uz: "", name_ru: "", slug: "", type: "film" });
    load();
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .update({ name_uz: editName })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Yangilandi");
    setEditId(null);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategoriyasini o'chirasizmi?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("O'chirib bo'lmadi: " + error.message); return; }
    toast.success("O'chirildi");
    load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-32 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>KATEGORIYALAR</h1>
          <p className="text-[0.7rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
            Jami: {categories.length} ta kategoriya
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="btn-retro btn-retro-filled flex items-center gap-2 text-[0.65rem]"
        >
          <Plus size={12} /> Yangi kategoriya
        </button>
      </div>

      {/* Yangi kategoriya formasi */}
      {showNew && (
        <div
          className="p-5 mb-6"
          style={{ background: "#EDE3CC", border: "1px solid rgba(217,164,65,0.3)" }}
        >
          <p className="text-vhs text-[0.6rem] tracking-widest mb-4" style={{ color: "#D9A441" }}>
            YANGI KATEGORIYA
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-vhs text-[0.52rem] tracking-widest block mb-1.5" style={{ color: "#764838" }}>
                O'ZBEK NOMI *
              </label>
              <input
                type="text"
                value={newForm.name_uz}
                onChange={(e) => setNewForm({ ...newForm, name_uz: e.target.value })}
                className="input-retro"
                placeholder="Milliy filmlar"
              />
            </div>
            <div>
              <label className="text-vhs text-[0.52rem] tracking-widest block mb-1.5" style={{ color: "#764838" }}>
                RUS NOMI
              </label>
              <input
                type="text"
                value={newForm.name_ru}
                onChange={(e) => setNewForm({ ...newForm, name_ru: e.target.value })}
                className="input-retro"
                placeholder="Национальные фильмы"
              />
            </div>
            <div>
              <label className="text-vhs text-[0.52rem] tracking-widest block mb-1.5" style={{ color: "#764838" }}>
                SLUG *
              </label>
              <input
                type="text"
                value={newForm.slug}
                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                className="input-retro"
                placeholder="milliy-filmlar"
              />
            </div>
            <div>
              <label className="text-vhs text-[0.52rem] tracking-widest block mb-1.5" style={{ color: "#764838" }}>
                TURI *
              </label>
              <select
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}
                className="input-retro"
              >
                <option value="film">Film</option>
                <option value="serial">Serial</option>
                <option value="cartoon">Multfilm</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="btn-retro btn-retro-filled flex items-center gap-1.5 text-[0.6rem]">
              <Check size={12} /> Saqlash
            </button>
            <button onClick={() => setShowNew(false)} className="btn-retro flex items-center gap-1.5 text-[0.6rem]">
              <X size={12} /> Bekor
            </button>
          </div>
        </div>
      )}

      {/* Kategoriyalar — type bo'yicha guruhlangan */}
      {CONTENT_TYPES.map(({ value, label, color }) => {
        const group = categories.filter((c) => c.type === value);
        return (
          <div key={value} className="mb-8">
            {/* Guruh sarlavhasi */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 mb-3"
              style={{ background: `${color}12`, borderLeft: `3px solid ${color}` }}
            >
              <span className="text-vhs text-[0.65rem] tracking-widest" style={{ color }}>
                {label.toUpperCase()}
              </span>
              <span
                className="text-[0.62rem] px-2 py-0.5 rounded"
                style={{ background: `${color}18`, color }}
              >
                {group.length} ta
              </span>
            </div>

            {/* Kategoriyalar jadval */}
            {group.length === 0 ? (
              <div
                className="px-4 py-6 text-center"
                style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <p className="text-[0.75rem]" style={{ color: "#764838", opacity: 0.5 }}>
                  Hali kategoriya yo&apos;q
                </p>
              </div>
            ) : (
              <div
                className="overflow-hidden"
                style={{ border: "1px solid rgba(0,0,0,0.08)" }}
              >
                {group.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 px-4 py-3"
                    style={{
                      background: idx % 2 === 0 ? "#EDE3CC" : "#EAE0C6",
                      borderBottom: idx < group.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {/* Slug badge */}
                    <span
                      className="text-vhs text-[0.52rem] tracking-wider px-2 py-1 flex-shrink-0"
                      style={{ background: "rgba(0,0,0,0.06)", color: "#764838" }}
                    >
                      {cat.slug}
                    </span>

                    {/* Nom — tahrirlash */}
                    {editId === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-retro py-1 text-[0.8rem] flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditId(null);
                        }}
                      />
                    ) : (
                      <span className="text-[0.82rem] flex-1" style={{ color: "#764838" }}>
                        {cat.name_uz}
                      </span>
                    )}

                    {cat.name_ru && (
                      <span className="text-[0.72rem] hidden sm:block" style={{ color: "#764838", opacity: 0.5 }}>
                        {cat.name_ru}
                      </span>
                    )}

                    {/* Amallar */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {editId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: "#D9A441" }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(217,164,65,0.1)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: "#764838" }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(cat.id); setEditName(cat.name_uz); }}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: "#764838" }}
                            title="Tahrirlash"
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name_uz)}
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
