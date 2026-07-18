import { Smartphone, RotateCw, LockKeyhole } from "lucide-react";

export function AndroidPage() {
  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>Android kiosk shell</h1>
        <p>Оболочка для Android touch-панелей поддерживает полноэкранный режим, блокировку навигации и поворот изображения.</p>
      </header>
      <div className="feature-grid">
        <article><Smartphone size={24} /><strong>Capacitor wrapper</strong><span>Web runtime упаковывается как Android-приложение.</span></article>
        <article><RotateCw size={24} /><strong>Rotation control</strong><span>Поворот 0/90/180/270 для нестандартного монтажа панели.</span></article>
        <article><LockKeyhole size={24} /><strong>Immersive kiosk</strong><span>Скрытие системных панелей и удержание приложения на экране.</span></article>
      </div>
    </section>
  );
}

