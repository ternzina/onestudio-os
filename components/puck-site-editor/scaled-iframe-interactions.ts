"use client";

import { useEffect, type RefObject } from "react";

export type PointerFrameRect = Pick<DOMRect, "left" | "top">;

export type PointerScale = {
  x: number;
  y: number;
};

/**
 * Convert a point from the parent document into iframe CSS pixels.
 *
 * This is the conversion needed for events observed by the parent document.
 * Events observed by an iframe document have already been converted by the
 * browser and must not be passed through this function a second time.
 */
export function mapParentPointerToIframe(
  point: Pick<MouseEvent, "clientX" | "clientY">,
  frameRect: PointerFrameRect,
  scale: PointerScale,
) {
  return {
    clientX: (point.clientX - frameRect.left) / (scale.x > 0 ? scale.x : 1),
    clientY: (point.clientY - frameRect.top) / (scale.y > 0 ? scale.y : 1),
  };
}

/**
 * Pointer coordinates from an iframe document are already in that document's
 * CSS-pixel coordinate space, including CSS transforms on the iframe's
 * parent. Keep this explicit so the two event realms cannot be mixed again.
 */
export function mapIframeDocumentPointer(
  point: Pick<MouseEvent, "clientX" | "clientY">,
) {
  return { clientX: point.clientX, clientY: point.clientY };
}

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

    // Movement stays native on the official source root. Only click-like
    // events need the shared scaled-canvas retargeting used by Puck controls.
    const eventTypes = ["pointerdown", "pointerup", "click"] as const;
    eventTypes.forEach((type) => document.addEventListener(type, retargetScaledInteraction, true));
    return () => {
      eventTypes.forEach((type) => document.removeEventListener(type, retargetScaledInteraction, true));
      delete root.dataset.scaledIframeInteractions;
    };
  }, [rootRef]);
}
