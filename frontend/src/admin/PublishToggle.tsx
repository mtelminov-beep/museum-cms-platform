export function PublishToggle({
  published,
  onChange,
  label,
  onLabel = "Опубликовано",
  offLabel = "Скрыто"
}: {
  published: boolean;
  onChange: (next: boolean) => void;
  label: string;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <label className="admin-publish-toggle">
      <input type="checkbox" checked={published} onChange={(e) => onChange(e.target.checked)} />
      <span className="admin-publish-toggle__track" aria-hidden="true">
        <span className="admin-publish-toggle__thumb" />
      </span>
      <span className="admin-publish-toggle__text">
        <strong>{published ? onLabel : offLabel}</strong>
        <small>{label}</small>
      </span>
    </label>
  );
}
