"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
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

export default function TopCategories({ t }: any) {
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
          collection(db, "categories"),
          orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(data);
      } catch (error) {
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
    <section className="py-10 sm:py-12 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-8">
          {t("landingPage.categories.title") || "Popular Categories"}
        </h3>

        {/* ⏳ Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 animate-pulse rounded-xl"
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
                    className="flex-shrink-0 snap-center w-28 h-24 flex flex-col items-center justify-center 
                               bg-background-secondary rounded-xl hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 
                               transition cursor-pointer shadow-sm hover:shadow-md focus:outline-none"
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
            <div
              className={`hidden sm:grid justify-center gap-4 sm:gap-6 ${
                categories.length <= 2
                  ? "grid-cols-2 max-w-md mx-auto"
                  : categories.length === 3
                  ? "grid-cols-3 max-w-2xl mx-auto"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              }`}
            >
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
                    className="flex flex-col items-center justify-center p-5 bg-background-secondary rounded-xl 
                               hover:bg-primary/10 transition cursor-pointer shadow-sm hover:shadow-md min-w-[120px]
                               focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    <Icon className="text-primary w-7 h-7 mb-2" />
                    <span className="text-sm font-medium text-text-primary truncate w-full text-center">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
