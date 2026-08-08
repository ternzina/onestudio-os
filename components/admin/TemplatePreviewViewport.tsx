"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type TemplatePreviewViewportHandle = {
  scrollTo: (selector: string) => void;
};

function copyPreviewStyles(target: Document) {
  target.head.querySelectorAll("[data-template-preview-style]").forEach((node) => node.remove());

  document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style').forEach((source) => {
    const clone = source.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
    clone.setAttribute("data-template-preview-style", "true");
    if (source instanceof HTMLLinkElement && clone instanceof HTMLLinkElement) clone.href = source.href;
    target.head.appendChild(clone);
  });
}

const TemplatePreviewViewport = forwardRef<TemplatePreviewViewportHandle, {
  children: ReactNode;
  title: string;
  width: number;
  scale: number;
}>(({ children, title, width, scale }, ref) => {
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const [effectiveScale, setEffectiveScale] = useState(scale);
  const displayWidth = Math.round(width * scale);
  const viewportHeight = Math.round(720 / effectiveScale);

  useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return;
    const resize = () => setEffectiveScale(Math.max(0.1, Math.min(scale, box.clientWidth / width)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    return () => observer.disconnect();
  }, [scale, width]);

  useImperativeHandle(ref, () => ({
    scrollTo(selector) {
      previewDocument?.querySelector<HTMLElement>(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }), [previewDocument]);

  return <div ref={frameBoxRef} className="mx-auto h-[720px] w-full max-w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,.12)]" style={{ maxWidth: displayWidth }}>
    <iframe
      title={title}
      srcDoc="<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><style>html,body{margin:0;min-width:0;background:#fff}</style></head><body></body></html>"
      className="block origin-top-left border-0 bg-white"
      style={{ width, height: viewportHeight, transform: `scale(${effectiveScale})` }}
      onLoad={(event) => {
        const frameDocument = event.currentTarget.contentDocument;
        if (!frameDocument) return;
        copyPreviewStyles(frameDocument);
        setPreviewDocument(frameDocument);
      }}
    />
    {previewDocument ? createPortal(children, previewDocument.body) : null}
  </div>;
});

TemplatePreviewViewport.displayName = "TemplatePreviewViewport";

export default TemplatePreviewViewport;
