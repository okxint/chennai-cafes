"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { cafes, Cafe } from "@/data/cafes";
import Sidebar from "@/components/Sidebar";

const CafeMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(cafes);

  const handleFilterChange = useCallback((filtered: Cafe[]) => {
    setFilteredCafes(filtered);
  }, []);

  return (
    <div style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Sidebar
        cafes={cafes}
        selectedCafe={selectedCafe}
        onSelectCafe={(cafe) => {
          setSelectedCafe(cafe);
          // On mobile, collapse sidebar when selecting
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setCollapsed(true);
          }
        }}
        onFilterChange={handleFilterChange}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className={`map-container ${collapsed ? "" : ""}`}>
        <CafeMap
          cafes={filteredCafes}
          selectedCafe={selectedCafe}
          onSelectCafe={(cafe) => {
            setSelectedCafe(cafe);
            setCollapsed(false);
          }}
        />
      </div>

      {/* Vis badge */}
      <div className="vis-badge">
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          ☕ Chennai Cafes
        </p>
        <p className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          {filteredCafes.length === cafes.length
            ? `${cafes.length} spots mapped`
            : `${filteredCafes.length} of ${cafes.length} shown`}
        </p>
      </div>
    </div>
  );
}
