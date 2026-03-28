"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
}

export default function Toast({ message, visible, onDone }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        setTimeout(onDone, 300);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  if (!visible && !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: `translateX(-50%) translateY(${show ? "0" : "20px"})`,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        padding: "10px 20px",
        borderRadius: "var(--radius)",
        fontSize: 13,
        fontWeight: 500,
        zIndex: 100,
        opacity: show ? 1 : 0,
        transition: "all 0.3s ease",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}
