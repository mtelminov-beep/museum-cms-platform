import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCatalog, subscribeCatalogUpdates } from "../api";
import { CMS_CATALOG_KEYS } from "../cmsConfig";
import { catalogDefaults } from "../data/defaults";
import type { CmsCatalogKey } from "../types";

type CatalogMap = Record<CmsCatalogKey, unknown>;

interface CatalogContextValue {
  catalogs: CatalogMap;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveLocal: (key: CmsCatalogKey, payload: unknown) => void;
  getCatalog: <T>(key: CmsCatalogKey) => T;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);
const LOCAL_PREFIX = "museum-cms-catalog-local:";

function withDefaults(map: Partial<CatalogMap>): CatalogMap {
  const next = { ...catalogDefaults } as CatalogMap;
  for (const key of CMS_CATALOG_KEYS) {
    if (map[key] != null) next[key] = map[key];
  }
  return next;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalogs, setCatalogs] = useState<CatalogMap>(() => withDefaults({}));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.all(CMS_CATALOG_KEYS.map((key) => fetchCatalog(key)));
      const map: Partial<CatalogMap> = {};
      for (const entry of entries) {
        if (entry.payload != null) {
          map[entry.key as CmsCatalogKey] = entry.payload;
        }
      }
      setCatalogs(withDefaults(map));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить каталоги");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLocal = useCallback((key: CmsCatalogKey, payload: unknown) => {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(payload));
    setCatalogs((prev) => ({ ...prev, [key]: payload }));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => subscribeCatalogUpdates(() => void refresh()), [refresh]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      catalogs,
      loading,
      error,
      refresh,
      saveLocal,
      getCatalog: <T,>(key: CmsCatalogKey) => catalogs[key] as T
    }),
    [catalogs, loading, error, refresh, saveLocal]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalogs() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalogs must be used within CatalogProvider");
  return ctx;
}
