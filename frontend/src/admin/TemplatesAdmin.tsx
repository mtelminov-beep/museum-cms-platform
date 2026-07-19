import { useEffect, useState, type CSSProperties } from "react";
import { applyTemplateFully } from "../templates/applyTemplate";
import { applyTemplateToDocument, TEMPLATE_PRESETS } from "../templates/presets";

export function TemplatesAdmin() {
  const [activeId, setActiveId] = useState(localStorage.getItem("museum-cms-template") || "shihm-cultural-route");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === activeId) || TEMPLATE_PRESETS[0];
    applyTemplateToDocument(preset);
  }, [activeId]);

  const apply = async (id: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === id);
    if (!preset || busy) return;
    setBusy(true);
    setActiveId(id);
    try {
      await applyTemplateFully(preset);
      setStatus(
        `Применён шаблон «${preset.name}»: шрифты, меню, представление и разделы по умолчанию.`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка применения шаблона");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="templates-admin">
      <header className="admin-main__head">
        <div>
          <h1>Стилистические шаблоны</h1>
          <p className="hint">
            Полный пакет оформления: цвета, шрифты, стиль меню и главной. Меню и страницы —
            канонические разделы сайта; уже заполненный контент не удаляется. {status}
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
                "--ink": preset.tokens.ink,
                "--font-display": preset.tokens.fontDisplay
              } as CSSProperties
            }
          >
            <div
              className="template-card__preview"
              data-hero={preset.tokens.heroStyle}
              data-menu={preset.tokens.menuStyle}
            >
              <span style={{ fontFamily: preset.tokens.fontDisplay }}>{preset.name}</span>
            </div>
            <h3 style={{ fontFamily: preset.tokens.fontDisplay }}>{preset.name}</h3>
            <p>{preset.description}</p>
            <small>
              меню: {preset.tokens.menuStyle} · hero: {preset.tokens.heroStyle} ·{" "}
              {preset.tokens.fontDisplay.split(",")[0].replace(/"/g, "")}
            </small>
            <button type="button" className="btn" disabled={busy} onClick={() => void apply(preset.id)}>
              {busy && activeId === preset.id ? "Применяем…" : activeId === preset.id ? "Активен" : "Применить"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
