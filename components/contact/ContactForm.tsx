"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Barcha maydonlarni to‘ldiring");
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(`RetroKino: ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:hello@retrokino.uz?subject=${subject}&body=${body}`;
    toast.success("Pochta dasturi ochildi");
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-vhs text-[0.55rem] text-[#764838] tracking-widest block mb-1.5 uppercase">
          Ism
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-retro"
          placeholder="ISMINGIZ"
          required
        />
      </div>
      <div>
        <label className="text-vhs text-[0.55rem] text-[#764838] tracking-widest block mb-1.5 uppercase">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-retro"
          placeholder="EMAIL"
          required
        />
      </div>
      <div>
        <label className="text-vhs text-[0.55rem] text-[#764838] tracking-widest block mb-1.5 uppercase">
          Xabar
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-retro min-h-32 py-3"
          placeholder="XABARINGIZ"
          required
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="btn-retro btn-retro-filled disabled:opacity-50"
      >
        {sending ? "Yuborilmoqda..." : "Yuborish"}
      </button>
    </form>
  );
}
