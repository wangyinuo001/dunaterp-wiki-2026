import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    mountIGEMPBRModel?: (containerId: string) => void;
  }
}

let widgetScriptPromise: Promise<void> | null = null;

function loadPBRWidgetScript() {
  if (window.mountIGEMPBRModel) return Promise.resolve();
  if (widgetScriptPromise) return widgetScriptPromise;

  widgetScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const base = import.meta.env.BASE_URL || '/';

    script.src = `${base.endsWith('/') ? base : `${base}/`}widgets/wiki_pbr_live_widget.js`;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PBR widget script.'));

    document.head.appendChild(script);
  });

  return widgetScriptPromise;
}

export function PBRWidget() {
  const containerId = useRef(`igem-pbr-live-model-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    loadPBRWidgetScript()
      .then(() => {
        if (cancelled) return;
        window.mountIGEMPBRModel?.(containerId.current);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pbr-widget-shell">
      <div id={containerId.current} />
    </div>
  );
}