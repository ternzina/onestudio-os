"use client";

import { useEffect, type RefObject } from "react";

export function useScaledIframeInteractionRetargeting(
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    const document = root?.ownerDocument;
    const view = document?.defaultView;
    const frame = view?.frameElement as HTMLElement | null;
    if (!root || !document || !view || !frame) return;
    root.dataset.scaledIframeInteractions = "ready";
    const forwardedEvents = new WeakSet<Event>();

    const retargetScaledInteraction = (event: MouseEvent | PointerEvent) => {
      if (forwardedEvents.has(event)) return;
      if (document.querySelector("[data-puck-entry]")?.getAttribute("data-puck-preview-mode") !== "interactive") return;

      const frameRect = frame.getBoundingClientRect();
      const scaleX = frame.offsetWidth > 0 ? frameRect.width / frame.offsetWidth : 1;
      const scaleY = frame.offsetHeight > 0 ? frameRect.height / frame.offsetHeight : 1;
      if (scaleX <= 0 || scaleY <= 0 || (Math.abs(scaleX - 1) < 0.001 && Math.abs(scaleY - 1) < 0.001)) return;

      const clientX = event.clientX / scaleX;
      const clientY = event.clientY / scaleY;
      const target = document.elementFromPoint(clientX, clientY);
      if (!target || target === event.target) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.type === "pointerdown") {
        const focusTarget = target.closest("button, input, select, textarea, [tabindex]") as HTMLElement | null;
        focusTarget?.focus({ preventScroll: true });
      }

      const commonInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view,
        detail: event.detail,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX,
        clientY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        button: event.button,
        buttons: event.buttons,
      };

      const forwarded = event.type.startsWith("pointer")
        ? new view.PointerEvent(event.type, {
            ...commonInit,
            pointerId: (event as PointerEvent).pointerId,
            pointerType: (event as PointerEvent).pointerType,
            isPrimary: (event as PointerEvent).isPrimary,
            width: (event as PointerEvent).width,
            height: (event as PointerEvent).height,
            pressure: (event as PointerEvent).pressure,
          })
        : new view.MouseEvent(event.type, commonInit);

      forwardedEvents.add(forwarded);
      target.dispatchEvent(forwarded);
    };

    const eventTypes = ["pointerdown", "pointerup", "click"] as const;
    eventTypes.forEach((type) => document.addEventListener(type, retargetScaledInteraction, true));
    return () => {
      eventTypes.forEach((type) => document.removeEventListener(type, retargetScaledInteraction, true));
      delete root.dataset.scaledIframeInteractions;
    };
  }, [rootRef]);
}
