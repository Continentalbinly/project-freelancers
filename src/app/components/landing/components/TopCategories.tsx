"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import MarketingSection from "@/app/(page)/components/MarketingSection";
import Stagger from "@/app/components/motion/Stagger";
import StaggerItem from "@/app/components/motion/StaggerItem";
import {
  Briefcase,
  Code,
  Headphones,
  Layers,
  TabletSmartphone,
  NotebookPen,
  Frame,
} from "lucide-react";

const iconList = [
  Code,
  TabletSmartphone,
  Briefcase,
  NotebookPen,
  Frame,
  Headphones,
  Layers,
];

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

interface TopCategoriesProps {
  t: (key: string) => string;
}

export default function TopCategories({ t }: TopCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Pull current language directly from translation context
  const { currentLanguage } = useTranslationContext();

  // 🔹 Fetch Firestore categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(requireDb(), "categories"),
          orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(data);
      } catch {
        //console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 🧭 Handle click → navigate to /projects?category=<id>
  const handleClick = (cat: Category) => {
    router.push(`/projects?category=${encodeURIComponent(cat.id)}`);
  };

  return (
    <MarketingSection
      id="categories"
      title={t("landingPage.categories.title") || "Popular Categories"}
      background="default"
    >
      {/* ⏳ Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-background-tertiary animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <>
          {/* 📱 Mobile view — horizontal scroll */}
          <div className="flex sm:hidden overflow-x-auto gap-4 px-2 pb-3 scrollbar-hide snap-x snap-mandatory">
            {categories.map((cat, i) => {
              const Icon = iconList[i % iconList.length];
              const name =
                currentLanguage === "lo"
                  ? cat.name_lo || cat.name_en
                  : cat.name_en || cat.name_lo;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleClick(cat)}
                  className="shrink-0 snap-center w-28 h-24 flex flex-col items-center justify-center 
                               rounded-2xl border border-border bg-background-secondary
                               hover:border-primary/40 hover:shadow-md hover:bg-background-tertiary
                               transition-[box-shadow,border-color,background-color] duration-200
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                >
                  <Icon className="text-primary w-6 h-6 mb-1" />
                  <span className="text-xs font-medium text-text-primary text-center leading-tight">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 💻 Desktop / Tablet grid */}
          <Stagger className="hidden sm:grid justify-center gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat, i) => {
              const Icon = iconList[i % iconList.length];
              const name =
                currentLanguage === "lo"
                  ? cat.name_lo || cat.name_en
                  : cat.name_en || cat.name_lo;

              return (
                <StaggerItem key={cat.id}>
                  <button
                    onClick={() => handleClick(cat)}
                    className="flex flex-col items-center justify-center p-5 
                               rounded-2xl border border-border bg-background-secondary min-w-[120px]
                               hover:border-primary/40 hover:shadow-md hover:bg-background-tertiary
                               transition-[box-shadow,border-color,background-color] duration-200
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <Icon className="text-primary w-7 h-7 mb-2" />
                    <span className="text-sm font-medium text-text-primary truncate w-full text-center">
                      {name}
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </>
      )}
    </MarketingSection>
  );
}
