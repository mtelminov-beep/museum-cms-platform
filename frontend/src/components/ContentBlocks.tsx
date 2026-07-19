import { Link } from "react-router-dom";
import type { ContentBlock } from "../types";

function EmptyPlaceholder({ label }: { label: string }) {
  return <div className="content-block content-block--placeholder">{label}</div>;
}

export function BlockView({
  block,
  showEmpty = false
}: {
  block: ContentBlock;
  showEmpty?: boolean;
}) {
  const align = block.align || "left";
  const style = { textAlign: align as "left" | "center" | "right", padding: `${block.paddingY ?? 16}px 0` };

  if (block.type === "hero") {
    return (
      <section
        className="content-block content-block--hero"
        style={{
          ...style,
          backgroundImage: block.src
            ? `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.5)), url(${block.src})`
            : undefined
        }}
      >
        <h2>{block.title || (showEmpty ? "Заголовок секции" : "")}</h2>
        {block.text ? (
          <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} />
        ) : showEmpty ? (
          <p className="hint">Короткое описание для посетителя</p>
        ) : null}
        {block.buttonLabel ? (
          block.href ? (
            <Link className="btn" to={block.href} onClick={(e) => e.preventDefault()}>
              {block.buttonLabel}
            </Link>
          ) : (
            <span className="btn">{block.buttonLabel}</span>
          )
        ) : null}
      </section>
    );
  }

  if (block.type === "heading") {
    if (!block.title && !showEmpty) return null;
    return (
      <h2 className="content-block" style={style}>
        {block.title || "Заголовок"}
      </h2>
    );
  }

  if (block.type === "divider") return <hr className="content-block" />;

  if (block.type === "quote" || block.type === "text") {
    if (!block.text?.trim() && !block.title) {
      return showEmpty ? <EmptyPlaceholder label={block.type === "quote" ? "Цитата" : "Текстовый блок"} /> : null;
    }
    return (
      <div className={`content-block content-block--${block.type}`} style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "" }} />
      </div>
    );
  }

  if (block.type === "image") {
    if (!block.src) {
      return showEmpty ? <EmptyPlaceholder label="Изображение — загрузите файл в свойствах" /> : null;
    }
    return (
      <figure className="content-block content-block--image" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <img src={block.src} alt={block.caption || block.title || ""} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "gallery") {
    const items = block.items || [];
    if (!items.length) {
      return showEmpty ? <EmptyPlaceholder label="Галерея — добавьте изображения" /> : null;
    }
    return (
      <div className="content-block content-block--gallery" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <div className="tilda-gallery">
          {items.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    if (!block.src) {
      return showEmpty ? <EmptyPlaceholder label="Видео — загрузите файл в свойствах" /> : null;
    }
    return (
      <figure className="content-block" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <video src={block.src} controls preload="metadata" />
      </figure>
    );
  }

  if (block.type === "audio") {
    if (!block.src) {
      return showEmpty ? <EmptyPlaceholder label="Аудио — загрузите файл в свойствах" /> : null;
    }
    return (
      <div className="content-block" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <audio src={block.src} controls preload="none" />
      </div>
    );
  }

  if (block.type === "cta" || block.type === "ticket" || block.type === "qr") {
    return (
      <div className={`content-block content-block--cta`} style={style}>
        {block.title ? <h3>{block.title}</h3> : showEmpty ? <h3>Кнопка действия</h3> : null}
        {block.text ? <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
        {block.buttonLabel ? (
          block.href ? (
            <Link className="btn" to={block.href} onClick={(e) => e.preventDefault()}>
              {block.buttonLabel}
            </Link>
          ) : (
            <span className="btn">{block.buttonLabel}</span>
          )
        ) : showEmpty ? (
          <span className="btn">Кнопка</span>
        ) : null}
      </div>
    );
  }

  if (block.type === "map" || block.type === "columns" || block.type === "exhibit-cards" || block.type === "event-cards") {
    if (!block.title && !block.text && !block.src && !showEmpty) return null;
    return (
      <div className="content-block" style={style}>
        {block.title ? <h3>{block.title}</h3> : showEmpty ? <h3>{block.type}</h3> : null}
        {block.text ? <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
        {block.src ? <img src={block.src} alt="" /> : null}
        {showEmpty && !block.text && !block.src ? (
          <p className="hint">Блок связан с данными страницы — настройте справа</p>
        ) : null}
      </div>
    );
  }

  return null;
}

export function ContentBlocks({
  blocks,
  showEmpty = false
}: {
  blocks?: ContentBlock[];
  showEmpty?: boolean;
}) {
  const list = (blocks ?? []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="content-blocks">
      {list.map((block, index) => (
        <BlockView key={block.id || index} block={block} showEmpty={showEmpty} />
      ))}
    </div>
  );
}
