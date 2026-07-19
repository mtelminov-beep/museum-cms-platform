import type { ContentBlock } from "../types";

function BlockView({ block }: { block: ContentBlock }) {
  if (block.type === "text") {
    if (!block.text?.trim()) return null;
    return (
      <div className="content-block content-block--text">
        {block.title ? <h3>{block.title}</h3> : null}
        <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text }} />
      </div>
    );
  }
  if (block.type === "image") {
    if (!block.src) return null;
    return (
      <figure className="content-block content-block--image">
        {block.title ? <h3>{block.title}</h3> : null}
        <img src={block.src} alt={block.caption || block.title || ""} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  if (block.type === "video") {
    if (!block.src) return null;
    return (
      <figure className="content-block content-block--video">
        {block.title ? <h3>{block.title}</h3> : null}
        <video src={block.src} controls preload="metadata" />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  if (block.type === "audio") {
    if (!block.src) return null;
    return (
      <div className="content-block content-block--audio">
        {block.title ? <h3>{block.title}</h3> : null}
        <audio src={block.src} controls preload="none" />
        {block.caption ? <p>{block.caption}</p> : null}
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
