type EventProperties = Record<string, string | number | boolean>;

type Gtag = (command: 'event', event: string, properties: EventProperties) => void;

export function trackEvent(event: string, properties: EventProperties) {
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') gtag('event', event, properties);
}

export function trackMarkedLinks() {
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-track-event]');
    if (!link) return;
    const name = link.dataset.trackEvent;
    const properties = link.dataset.trackProperties;
    if (!name || !properties) return;
    trackEvent(name, JSON.parse(properties) as EventProperties);
  });
}
