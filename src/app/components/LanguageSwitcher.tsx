"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslationContext } from "./LanguageProvider";
import { Language, languages } from "@/lib/i18n/config";

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useTranslationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const orderedLanguages: Language[] = ["lo", "en"];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-detect open direction
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;
      setOpenDirection(
        spaceBelow < 100 && spaceAbove > spaceBelow ? "up" : "down"
      );
    }
  }, [isOpen]);

  const getFlagImage = (lang: Language) =>
    lang === "lo"
      ? "/images/assets/laos.png"
      : lang === "en"
      ? "/images/assets/usa.png"
      : "/images/assets/usa.png";

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* 🌐 Circle flag button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-9 h-9 rounded-full border border-border bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden"
      >
        <div className="w-full h-full flex items-center justify-center rounded-full overflow-hidden">
          <img
            src={getFlagImage(currentLanguage)}
            alt={`${languages[currentLanguage].nativeName} flag`}
            className="object-cover object-center w-full h-full"
          />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: openDirection === "down" ? -6 : 6,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: openDirection === "down" ? -6 : 6,
              scale: 0.95,
            }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${
              openDirection === "up"
                ? "bottom-full mb-2 origin-bottom"
                : "top-full mt-2 origin-top"
            } left-1/2 -translate-x-1/2 flex flex-col items-center gap-2`}
          >
            {orderedLanguages
              .filter((lang) => lang !== currentLanguage)
              .map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className="w-9 h-9 rounded-full border border-border bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden"
                >
                  <div className="w-full h-full flex items-center justify-center rounded-full overflow-hidden">
                    <img
                      src={getFlagImage(lang)}
                      alt={`${languages[lang].nativeName} flag`}
                      className="object-cover object-center w-full h-full"
                    />
                  </div>
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
