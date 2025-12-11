"use client";

import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  disabled,
  placeholder,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onSend(text);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-background px-4 py-3 flex gap-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Type your message..."}
        className="flex-1 px-4 py-2 text-sm border border-border rounded-full bg-background-secondary text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="btn btn-primary rounded-full px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <PaperAirplaneIcon className="w-4 h-4" />
      </button>
    </form>
  );
}
