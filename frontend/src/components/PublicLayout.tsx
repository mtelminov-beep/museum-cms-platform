import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCatalogs } from "../stores/CatalogContext";
import type { NavigationConfig } from "../types";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { getCatalog } = useCatalogs();
  const nav = getCatalog<NavigationConfig>("cms-navigation-v1");
  const items = (nav.items || []).filter((item) => item.published);

  return (
    <div className="public-app">
      <header className="public-header">
        <Link to="/" className="public-brand">
          Museum CMS
        </Link>
        <nav>
          {items.map((item) => (
            <NavLink key={item.id} to={item.route} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {item.label}
            </NavLink>
          ))}
          <Link className="public-admin-link" to="/admin">
            Админ
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
