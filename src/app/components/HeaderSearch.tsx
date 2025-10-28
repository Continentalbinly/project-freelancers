// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useTranslationContext } from "@/app/components/LanguageProvider";
// import { db } from "@/service/firebase";
// import { collection, getDocs } from "firebase/firestore";

// interface Category {
//   id: string;
//   name_en: string;
//   name_lo: string;
// }

// export default function HeaderSearch() {
//   const { t, currentLanguage } = useTranslationContext();
//   const pathname = usePathname();

//   const [show, setShow] = useState(false);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("all");
//   const [status, setStatus] = useState("all");
//   const [showFilters, setShowFilters] = useState(false);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loadingCategories, setLoadingCategories] = useState(true);

//   // ✅ Fetch categories dynamically
//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const snap = await getDocs(collection(db, "categories"));
//         const list = snap.docs.map((d) => ({
//           id: d.id,
//           ...(d.data() as Omit<Category, "id">),
//         }));
//         setCategories(list);
//       } catch (err) {
//         console.error("❌ Failed to fetch categories:", err);
//       } finally {
//         setLoadingCategories(false);
//       }
//     }
//     fetchCategories();
//   }, []);

//   // ✅ Show search bar only on /projects page
//   useEffect(() => {
//     if (pathname !== "/projects") {
//       setShow(false);
//       return;
//     }

//     const handleScroll = () => {
//       const y = window.scrollY;
//       const trigger =
//         y > (document.getElementById("search-section")?.offsetHeight || 100);
//       setShow(trigger);
//     };

//     window.addEventListener("scroll", handleScroll);
//     handleScroll();

//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [pathname]);

//   const statuses = [
//     { value: "all", label: t("header.allStatus") },
//     { value: "open", label: t("header.open") },
//     { value: "in_progress", label: t("header.inProgress") },
//     { value: "completed", label: t("header.completed") },
//     { value: "cancelled", label: t("header.cancelled") },
//   ];

//   if (pathname !== "/projects") return null;

//   return (
//     <div
//       className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-border shadow-md transition-transform duration-300 ${
//         show ? "translate-y-0" : "-translate-y-full"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
//         {/* Search Header Row */}
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <h2 className="text-lg font-semibold text-text-primary">
//             {t("header.searchProjects")}
//           </h2>

//           <div className="flex gap-2 flex-1 justify-end">
//             <input
//               suppressHydrationWarning
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder={t("header.searchPlaceholder")}
//               className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//             />
//             <button
//               suppressHydrationWarning
//               onClick={() => setShowFilters((v) => !v)}
//               className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
//                 showFilters
//                   ? "bg-primary text-white border-primary"
//                   : "border-border text-text-primary hover:border-primary"
//               }`}
//             >
//               {t("header.filters")}
//             </button>
//             <Link
//               href={`/projects?search=${search}&category=${category}&status=${status}`}
//               className="btn btn-primary text-sm px-4"
//             >
//               {t("header.search")}
//             </Link>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
//             {/* 🏷️ Category */}
//             <div>
//               <label className="block text-xs mb-1">{t("category")}</label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 disabled={loadingCategories}
//                 className="w-full border border-border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary"
//               >
//                 <option value="all">
//                   {t("projects.filters.allCategories")}
//                 </option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {currentLanguage === "lo"
//                       ? c.name_lo || c.name_en
//                       : c.name_en || c.name_lo}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* 📊 Status */}
//             <div>
//               <label className="block text-xs mb-1">{t("status")}</label>
//               <select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="w-full border border-border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary"
//               >
//                 {statuses.map((s) => (
//                   <option key={s.value} value={s.value}>
//                     {s.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* ❌ Clear Filters */}
//             <div className="flex items-end">
//               <button
//                 suppressHydrationWarning
//                 onClick={() => {
//                   setSearch("");
//                   setCategory("all");
//                   setStatus("all");
//                 }}
//                 className="w-full border border-border rounded-lg px-3 py-1.5 hover:border-primary text-xs text-text-secondary"
//               >
//                 {t("clearFilters")}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
