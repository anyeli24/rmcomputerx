import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useCategories, useCatalogItems } from "@/hooks/use-site-data";

interface SearchResult {
  type: "producto" | "servicio";
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-primary font-semibold rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategories();
  const { data: catalogItems } = useCatalogItems();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const results: SearchResult[] = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const res: SearchResult[] = [];

    categories?.forEach((c: any) => {
      if (
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      ) {
        res.push({
          type: "producto",
          id: c.id,
          name: c.title,
          description: c.description,
        });
      }
    });

    catalogItems?.forEach((item: any) => {
      if (
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      ) {
        res.push({
          type: "servicio",
          id: item.id,
          name: item.name,
          category: item.category,
        });
      }
    });

    return res;
  })();

  const handleResultClick = (result: SearchResult) => {
    onClose();

    const prefix = result.type === "producto" ? "product" : "service";
    const elId = `${prefix}-${result.id}`;

    requestAnimationFrame(() => {
      const el = document.getElementById(elId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("search-highlight");
        setTimeout(() => el.classList.remove("search-highlight"), 2000);
      } else {
        // Fallback: scroll to section
        const section = document.getElementById(result.type === "producto" ? "productos" : "catalogo");
        section?.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div ref={containerRef} className="container max-w-2xl mx-auto pt-20 px-4">
        <div className="bg-background rounded-xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos o servicios..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === "" ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Escribe para buscar productos o servicios
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No se encontraron resultados
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleResultClick(r)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3"
                    >
                      <span className="mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        {r.type === "producto" ? "Producto" : "Servicio"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {highlightMatch(r.name, query)}
                        </p>
                        {r.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {highlightMatch(r.description, query)}
                          </p>
                        )}
                        {r.category && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Categoría: {highlightMatch(r.category, query)}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
