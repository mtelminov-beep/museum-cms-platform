import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PublicLayout } from "../components/PublicLayout";

export function ExhibitPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/entities/exhibits/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Не найдено");
        return res.json();
      })
      .then((data) => setItem(data.item))
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка"));
  }, [id]);

  if (error) {
    return (
      <PublicLayout>
        <main className="content-page">
          <h1>Экспонат не найден</h1>
          <Link to="/museum">← В меню</Link>
        </main>
      </PublicLayout>
    );
  }

  if (!item) return <main className="loading">Загрузка…</main>;

  return (
    <PublicLayout>
      <main className="content-page">
        <small>{String(item.inventoryNumber || "")}</small>
        <h1>{String(item.title || "")}</h1>
        {item.summary ? <p className="lead">{String(item.summary)}</p> : null}
        {item.description ? (
          <div className="rich-html" dangerouslySetInnerHTML={{ __html: String(item.description) }} />
        ) : null}
      </main>
    </PublicLayout>
  );
}

export function QrRedirectPage() {
  const { publicId } = useParams();
  const [message, setMessage] = useState("Открываем…");

  useEffect(() => {
    fetch(`/api/v1/entities/qrCodes`)
      .then((res) => res.json())
      .then((data) => {
        const qr = (data.items || []).find((item: { publicId?: string }) => item.publicId === publicId);
        if (!qr) {
          setMessage("QR не найден");
          return;
        }
        if (qr.targetType === "exhibit") {
          window.location.replace(`/exhibits/${qr.targetId}`);
          return;
        }
        if (qr.targetType === "exhibition") {
          window.location.replace(`/exhibitions/${qr.targetId}`);
          return;
        }
        if (qr.targetType === "page") {
          window.location.replace(`/page/${qr.targetId}`);
          return;
        }
        if (qr.targetType === "url" && qr.targetId) {
          window.location.replace(String(qr.targetId));
          return;
        }
        setMessage("Цель QR не настроена");
      })
      .catch(() => setMessage("Ошибка загрузки QR"));
  }, [publicId]);

  return <main className="loading">{message}</main>;
}
