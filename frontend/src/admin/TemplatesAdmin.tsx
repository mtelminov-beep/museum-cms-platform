import { useEffect, useState, type CSSProperties } from "react";
import { getCmsToken } from "../api";
import { TEMPLATE_PRESETS, applyTemplateToDocument } from "../templates/presets";

export function TemplatesAdmin() {
  const [activeId, setActiveId] = useState(localStorage.getItem("museum-cms-template") || "shihm-cultural-route");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === activeId) || TEMPLATE_PRESETS[0];
    applyTemplateToDocument(preset);
  }, [activeId]);

  const apply = async (id: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setActiveId(id);
    localStorage.setItem("museum-cms-template", id);
    applyTemplateToDocument(preset);
    try {
      const res = await fetch("/api/cms/state", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CMS-Token": getCmsToken()
        },
        body: JSON.stringify({
          museum: {
            theme: {
              accent: preset.tokens.accent,
              surface: preset.tokens.surface,
              ink: preset.tokens.ink
            }
          },
          settings: {
            activeTemplateId: preset.id
          }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(`Применён шаблон «${preset.name}»`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка сохранения темы");
    }
  };

  return (
    <div className="templates-admin">
      <header className="admin-main__head">
        <div>
          <h1>Стилистические шаблоны</h1>
          <p className="hint">
            Пресеты оформления сайта. Контент не удаляется при смене темы. {status}
          </p>
        </div>
      </header>
      <div className="templates-grid">
        {TEMPLATE_PRESETS.map((preset) => (
          <article
            key={preset.id}
            className={`template-card${activeId === preset.id ? " active" : ""}`}
            style={
              {
                "--accent": preset.tokens.accent,
                "--surface": preset.tokens.surface,
                "--ink": preset.tokens.ink
              } as CSSProperties
            }
          >
            <div className="template-card__preview" data-hero={preset.tokens.heroStyle}>
              <span>{preset.name}</span>
            </div>
            <h3>{preset.name}</h3>
            <p>{preset.description}</p>
            <small>{preset.id}</small>
            <button type="button" className="btn" onClick={() => void apply(preset.id)}>
              {activeId === preset.id ? "Активен" : "Применить"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
