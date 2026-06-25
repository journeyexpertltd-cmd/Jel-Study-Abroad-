import React, { useState, useEffect, useRef } from "react";
import { Search, GraduationCap, Award, BookOpen, Clock, ArrowRight, X, Calendar, Globe } from "lucide-react";
import { UNIVERSITY_PARTNERS, SCHOLARSHIPS, BLOGS } from "../data";
import { PartnerUniversity, Scholarship, BlogItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  setUniversitySearch: (term: string) => void;
  setScholarshipSearch: (term: string) => void;
  setBlogSearch: (term: string) => void;
  setInitialBlogId: (id: string | null) => void;
}

type SearchCategory = "all" | "universities" | "scholarships" | "blogs";

export function SearchModal({
  isOpen,
  onClose,
  setActiveTab,
  setUniversitySearch,
  setScholarshipSearch,
  setBlogSearch,
  setInitialBlogId,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Keybind listeners (Escape to close, Cmd/Ctrl+K to open handled in parent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Get matching items
  const getFilteredItems = () => {
    if (!query.trim()) return { universities: [], scholarships: [], blogs: [] };
    
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matchesText = (text: string) => {
      const lower = text.toLowerCase();
      return terms.every(term => lower.includes(term));
    };

    const universities = UNIVERSITY_PARTNERS.filter(uni => 
      matchesText(uni.name) || 
      matchesText(uni.country) || 
      uni.popularPrograms.some(prog => matchesText(prog)) ||
      matchesText(uni.scholarshipAvailable) ||
      matchesText(uni.ranking)
    );

    const scholarships = SCHOLARSHIPS.filter(sch => 
      matchesText(sch.title) || 
      matchesText(sch.country) || 
      matchesText(sch.coverage) || 
      matchesText(sch.eligibility) || 
      matchesText(sch.description)
    );

    const blogs = BLOGS.filter(b => 
      matchesText(b.title) || 
      matchesText(b.category) || 
      matchesText(b.excerpt) || 
      matchesText(b.content) || 
      matchesText(b.author)
    );

    return { universities, scholarships, blogs };
  };

  const { universities, scholarships, blogs } = getFilteredItems();

  // Combine items for unified keyboard navigation based on activeCategory filter
  const getFlatResultsList = () => {
    const list: Array<
      | { type: "university"; data: PartnerUniversity }
      | { type: "scholarship"; data: Scholarship }
      | { type: "blog"; data: BlogItem }
    > = [];

    if (activeCategory === "all" || activeCategory === "universities") {
      universities.forEach(uni => list.push({ type: "university", data: uni }));
    }
    if (activeCategory === "all" || activeCategory === "scholarships") {
      scholarships.forEach(sch => list.push({ type: "scholarship", data: sch }));
    }
    if (activeCategory === "all" || activeCategory === "blogs") {
      blogs.forEach(b => list.push({ type: "blog", data: b }));
    }

    return list;
  };

  const resultsList = getFlatResultsList();

  // Keyboard navigation inside the list
  useEffect(() => {
    const handleListKeys = (e: KeyboardEvent) => {
      if (!isOpen || resultsList.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % resultsList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + resultsList.length) % resultsList.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = resultsList[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener("keydown", handleListKeys);
    return () => window.removeEventListener("keydown", handleListKeys);
  }, [isOpen, resultsList, selectedIndex]);

  // Adjust scroll when selectedIndex changes
  useEffect(() => {
    const activeEl = containerRef.current?.querySelector(".search-result-active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const handleSelect = (
    item:
      | { type: "university"; data: PartnerUniversity }
      | { type: "scholarship"; data: Scholarship }
      | { type: "blog"; data: BlogItem }
  ) => {
    onClose();
    if (item.type === "university") {
      setUniversitySearch(item.data.name);
      setActiveTab("universities");
    } else if (item.type === "scholarship") {
      setScholarshipSearch(item.data.title);
      setActiveTab("scholarships");
    } else if (item.type === "blog") {
      setBlogSearch(item.data.title);
      setInitialBlogId(item.data.id);
      setActiveTab("blog");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasResults = resultsList.length > 0;
  const isQueryTyped = query.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vw] px-4" id="search-modal-root">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            id="search-backdrop"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 z-10 text-left"
            id="search-dialog-panel"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center space-x-3 relative">
              <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search universities, scholarships, visa guides..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none py-1.5 focus:ring-0"
                id="modal-search-field"
              />
              {isQueryTyped && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block bg-slate-50 border border-slate-200 text-slate-400 text-[10px] leading-tight px-1.5 py-1 rounded font-mono font-bold shrink-0 shadow-xs">
                ESC
              </kbd>
            </div>

            {/* In-Modal Filter Segments */}
            {isQueryTyped && (
              <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center space-x-1 overflow-x-auto shrink-0 scrollbar-none">
                {(["all", "universities", "scholarships", "blogs"] as SearchCategory[]).map(cat => {
                  let badgeCount = 0;
                  if (cat === "all") badgeCount = universities.length + scholarships.length + blogs.length;
                  else if (cat === "universities") badgeCount = universities.length;
                  else if (cat === "scholarships") badgeCount = scholarships.length;
                  else if (cat === "blogs") badgeCount = blogs.length;

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setSelectedIndex(0);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 uppercase tracking-wider ${
                        activeCategory === cat
                          ? "bg-[#0B5D3B] text-white shadow-xs"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      {cat} {badgeCount > 0 && <span className={`ml-1 text-[10px] opacity-80 ${activeCategory === cat ? "text-white" : "text-[#D4AF37]"}`}>({badgeCount})</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Results Display Area */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] min-h-[180px] bg-white scrollbar-thin"
              id="search-results-viewport"
            >
              {!isQueryTyped ? (
                // Recommendations UI when query is empty
                <div className="py-8 text-center space-y-4">
                  <div className="inline-flex p-3 bg-emerald-50 text-[#0B5D3B] rounded-2xl">
                    <GraduationCap className="h-6 w-6 text-[#D4AF37] animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-slate-800 text-sm">Search with Keywords</h4>
                    <p className="text-xs text-slate-405 text-slate-500 max-w-sm mx-auto">
                      Type terms like <span className="font-semibold text-[#0B5D3B]">"Canada"</span>, <span className="font-semibold text-[#0B5D3B]">"SOP"</span>, <span className="font-semibold text-[#0B5D3B]">"Monash"</span>, or <span className="font-semibold text-[#0B5D3B]">"Tuition"</span> to trigger real-time registry matches.
                    </p>
                  </div>
                  
                  {/* Quick Shortcut Buttons */}
                  <div className="pt-2 flex flex-wrap gap-1.5 justify-center max-w-md mx-auto">
                    {["Toronto", "Australia", "Visa Guides", "100% Scholarship", "IELTS Gap", "MBA"].map((suggest) => (
                      <button
                        key={suggest}
                        onClick={() => {
                          setQuery(suggest);
                          inputRef.current?.focus();
                        }}
                        className="text-[11px] font-bold border border-slate-200 hover:border-[#D4AF37] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-slate-650 transition duration-150"
                      >
                        ⚡ "{suggest}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : !hasResults ? (
                // Zero results UI
                <div className="py-12 text-center space-y-2">
                  <span className="text-3xl block">🔍</span>
                  <h4 className="font-display font-extrabold text-slate-800 text-sm">No registry matches found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    We couldn't find anything matching <span className="text-rose-600 font-semibold font-mono">"{query}"</span>. Try checking spelling or search in different categories.
                  </p>
                </div>
              ) : (
                // Structured categories results list
                <div className="space-y-1">
                  {resultsList.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    
                    if (item.type === "university") {
                      const uni = item.data;
                      return (
                        <div
                          key={`uni-${uni.id}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-slate-50 border-[#D4AF37]/50 shadow-xs search-result-active"
                              : "border-transparent hover:bg-slate-50/40"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-[#0B5D3B]/10 text-[#0B5D3B] font-display font-black text-xs h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
                              🏫
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                                  University • {uni.country}
                                </span>
                                <span className="text-xs font-bold text-amber-500 font-mono">
                                  {uni.ranking}
                                </span>
                              </div>
                              <h3 className="font-display font-bold text-[#0B5D3B] text-sm">
                                {uni.name}
                              </h3>
                              <p className="text-slate-500 text-xs flex flex-wrap gap-1 mt-1">
                                {uni.popularPrograms.map((p, i) => (
                                  <span key={i} className="bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded border border-slate-150/40 text-[10px]">
                                    {p}
                                  </span>
                                ))}
                              </p>
                              {uni.scholarshipAvailable && (
                                <p className="text-green-600 text-[11px] font-bold mt-1">
                                  🎁 Scholarship matches: {uni.scholarshipAvailable}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (item.type === "scholarship") {
                      const sch = item.data;
                      return (
                        <div
                          key={`sch-${sch.id}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-slate-50 border-[#c5a059]/50 shadow-xs search-result-active"
                              : "border-transparent hover:bg-slate-50/40"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-amber-50 text-amber-600 h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
                              🏆
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                                  Scholarship Waiver • {sch.country}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Ends: {sch.deadline}
                                </span>
                              </div>
                              <h3 className="font-display font-bold text-[#0B5D3B] text-sm">
                                {sch.title}
                              </h3>
                              <p className="text-amber-600 text-xs font-extrabold">
                                {sch.coverage}
                              </p>
                              <p className="text-slate-500 text-xs line-clamp-1">
                                {sch.description}
                              </p>
                              <p className="text-slate-400 text-[10px] bg-slate-50/10 border-l-2 border-slate-200 pl-2 py-0.5 mt-1 leading-normal">
                                <span className="font-bold">Mandate:</span> {sch.eligibility}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      const blog = item.data;
                      return (
                        <div
                          key={`blog-${blog.id}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-slate-50 border-[#c5a059]/50 shadow-xs search-result-active"
                              : "border-transparent hover:bg-slate-50/40"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-indigo-50 text-indigo-600 h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
                              📝
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                                  Guides & Blogs • {blog.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {blog.date}
                                </span>
                              </div>
                              <h3 className="font-display font-bold text-slate-900 text-sm">
                                {blog.title}
                              </h3>
                              <p className="text-slate-500 text-xs line-clamp-1 leading-normal">
                                {blog.excerpt}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-bold pt-1">
                                <Clock className="h-3 w-3" />
                                <span>{blog.readTime}</span>
                                <span>•</span>
                                <span className="text-slate-400">By {blog.author}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>

            {/* Keyboard Footer helper banner */}
            <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium select-none shrink-0">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <kbd className="bg-white border border-slate-205 py-0.5 px-1 rounded shadow-xs font-mono">↓</kbd>
                  <kbd className="bg-white border border-slate-205 py-0.5 px-1 rounded shadow-xs font-mono">↑</kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="bg-white border border-slate-205 py-0.5 px-1.5 rounded shadow-xs font-mono">Enter</kbd>
                  <span>to select</span>
                </span>
              </div>
              <div>
                <span>A brand of JEL Study Abroad</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
