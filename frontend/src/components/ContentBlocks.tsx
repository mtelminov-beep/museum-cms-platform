import { Link } from "react-router-dom";
import type { ContentBlock } from "../types";

function BlockView({ block }: { block: ContentBlock }) {
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
        <h2>{block.title}</h2>
        {block.text ? <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
        {block.buttonLabel && block.href ? (
          <Link className="btn" to={block.href}>
            {block.buttonLabel}
          </Link>
        ) : null}
      </section>
    );
  }

  if (block.type === "heading") {
    return (
      <h2 className="content-block" style={style}>
        {block.title}
      </h2>
    );
  }

  if (block.type === "divider") return <hr className="content-block" />;

  if (block.type === "quote" || block.type === "text") {
    if (!block.text?.trim() && !block.title) return null;
    return (
      <div className={`content-block content-block--${block.type}`} style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "" }} />
      </div>
    );
  }

  if (block.type === "image") {
    if (!block.src) return null;
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
    if (!items.length) return null;
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
    if (!block.src) return null;
    return (
      <figure className="content-block" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        <video src={block.src} controls preload="metadata" />
      </figure>
    );
  }

  if (block.type === "audio") {
    if (!block.src) return null;
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
        {block.title ? <h3>{block.title}</h3> : null}
        {block.text ? <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
        {block.buttonLabel && block.href ? (
          <Link className="btn" to={block.href}>
            {block.buttonLabel}
          </Link>
        ) : null}
      </div>
    );
  }

  if (block.type === "map" || block.type === "columns" || block.type === "exhibit-cards" || block.type === "event-cards") {
    return (
      <div className="content-block" style={style}>
        {block.title ? <h3>{block.title}</h3> : null}
        {block.text ? <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
        {block.src ? <img src={block.src} alt="" /> : null}
      </div>
    );
  }

  return null;
}

export function ContentBlocks({ blocks }: { blocks?: ContentBlock[] }) {
  const list = (blocks ?? []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="content-blocks">
      {list.map((block, index) => (
        <BlockView key={block.id || index} block={block} />
      ))}
    </div>
  );
}
