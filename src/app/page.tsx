"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { cafes, Cafe } from "@/data/cafes";
import Sidebar from "@/components/Sidebar";

const CafeMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(cafes);

  const handleFilterChange = useCallback((filtered: Cafe[]) => {
    setFilteredCafes(filtered);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      {/* Mobile toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-30 rounded-lg bg-zinc-900 border border-zinc-700 p-2 text-white shadow-lg md:hidden"
      >
        {showSidebar ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-20 w-[360px] transition-transform duration-300 md:relative md:translate-x-0`}
      >
        <Sidebar
          cafes={cafes}
          selectedCafe={selectedCafe}
          onSelectCafe={(cafe) => {
            setSelectedCafe(cafe);
            if (window.innerWidth < 768) setShowSidebar(false);
          }}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <CafeMap
          cafes={filteredCafes}
          selectedCafe={selectedCafe}
          onSelectCafe={(cafe) => {
            setSelectedCafe(cafe);
            setShowSidebar(true);
          }}
        />

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-10 rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 px-4 py-3 shadow-xl">
          <p className="text-xs font-medium text-zinc-400 mb-1.5">Chennai Cafes</p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500"></span>
            <span>
              {filteredCafes.length === cafes.length
                ? `${cafes.length} locations mapped`
                : `${filteredCafes.length} of ${cafes.length} shown`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
