"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface UserRoleChangerProps {
  userId: string;
  currentRole: string;
}

const ROLES = [
  { value: "user",      label: "Foydalanuvchi", color: "text-[#764838]" },
  { value: "moderator", label: "Moderator",      color: "text-[#764838]" },
  { value: "admin",     label: "Admin",          color: "text-[#764838]" },
];

export default function UserRoleChanger({ userId, currentRole }: UserRoleChangerProps) {
  const [role,      setRole]      = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router   = useRouter();

  const handleChange = async (newRole: string) => {
    if (newRole === role) return;

    if (newRole === "admin") {
      if (!confirm("Bu foydalanuvchiga admin huquqi berishni xohlaysizmi?")) return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      setRole(newRole);
      toast.success("Rol yangilandi");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      {ROLES.map((r) => (
        <button
          key={r.value}
          onClick={() => handleChange(r.value)}
          disabled={isLoading}
          className={cn(
            "badge-retro cursor-pointer text-[0.5rem] transition-all disabled:opacity-40",
            role === r.value ? "active" : ""
          )}
          aria-pressed={role === r.value}
          title={r.label}
        >
          {r.value === "user"      ? "User" :
           r.value === "moderator" ? "Mod"  : "Admin"}
        </button>
      ))}
    </div>
  );
}
