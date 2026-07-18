import type { MuseumState } from "../types";

export function DashboardPage({ state }: { state: MuseumState }) {
  const published = state.exhibitions.filter((item) => item.status === "published").length;
  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>Панель управления музеем</h1>
        <p>Единая CMS для сайта, интерактивных тач-панелей, ТВ, проекторов и планшетов.</p>
      </header>
      <div className="metric-row">
        <article>
          <span>Экспозиции</span>
          <strong>{state.exhibitions.length}</strong>
          <small>{published} опубликовано</small>
        </article>
        <article>
          <span>Носители</span>
          <strong>{state.screens.length}</strong>
          <small>{state.screens.filter((screen) => screen.kiosk).length} в kiosk-режиме</small>
        </article>
        <article>
          <span>Плейлисты</span>
          <strong>{state.playlists.length}</strong>
          <small>Синхронизируются с экранами</small>
        </article>
      </div>
      <div className="workband">
        <div>
          <h2>Архитектура контента</h2>
          <p>Создавайте разделы, витрины, медиа-стены и расписания без привязки к конкретному устройству.</p>
        </div>
        <div>
          <h2>Параллельные сценарии</h2>
          <p>Один материал может быть показан как сайт, карточка на тач-панели, ТВ-цикл или проекционный слайд.</p>
        </div>
      </div>
    </section>
  );
}

