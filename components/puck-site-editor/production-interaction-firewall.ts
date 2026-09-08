"use client";

import { useEffect, type RefObject } from "react";
import {
  policyAllowsPassiveHover,
  policyReservesClick,
  policyReservesDrag,
  policyReservesForm,
  type PuckInteractionPolicy,
  type PuckInteractionPolicyBucket,
  type PuckPassiveInteraction,
  type PuckReservedInteraction,
} from "@/lib/puck-site-editor/interaction-policy";

const ACTION_SELECTOR =
  "a[href],button,input,select,textarea,summary,[role=\"button\"],[tabindex],[contenteditable=\"true\"]";
const FORM_SELECTOR = "input,select,textarea,[contenteditable=\"true\"]";
const AUTHORING_EVENTS = [
  "click",
  "auxclick",
  "dblclick",
  "pointerdown",
  "mousedown",
  "touchstart",
  "submit",
  "focusin",
  "beforeinput",
  "input",
  "change",
  "keydown",
] as const;

function eventElement(target: EventTarget | null) {
  if (!target || typeof target !== "object" || !("closest" in target)) return null;
  return target as Element;
}

function blockForTarget(root: HTMLElement, target: EventTarget | null) {
  const element = eventElement(target);
  const block = element?.closest("[data-puck-component]");
  return block && root.contains(block) ? block : null;
}

function isDescendantTarget(block: Element, target: Element | null) {
  return Boolean(target && target !== block && block.contains(target));
}

function passiveInteraction(value: string | undefined): PuckPassiveInteraction {
  return value === "passive-edit" || value === "interact-only" ? value : "none";
}

function reservedInteraction(value: string | undefined): PuckReservedInteraction {
  return value === "none" ? "none" : "interact-only";
}

function policyForBlock(block: Element): PuckInteractionPolicy | null {
  const dataset = block as HTMLElement;
  if (!dataset.dataset.puckInteractionVisualRuntime) return null;
  const editBucket = dataset.dataset.puckInteractionBucket as PuckInteractionPolicyBucket | undefined;
  return {
    editBucket,
    visualRuntime: dataset.dataset.puckInteractionVisualRuntime === "static" ? "static" : "live",
    hover: passiveInteraction(dataset.dataset.puckInteractionHover),
    pointerMove: passiveInteraction(dataset.dataset.puckInteractionPointerMove),
    click: reservedInteraction(dataset.dataset.puckInteractionClick),
    drag: reservedInteraction(dataset.dataset.puckInteractionDrag),
    form: reservedInteraction(dataset.dataset.puckInteractionForm),
  };
}

function isAuthoringEdit(root: HTMLElement) {
  return previewMode(root) === "edit";
}

function previewMode(root: HTMLElement) {
  return root.ownerDocument
    .querySelector("[data-puck-entry]")
    ?.getAttribute("data-puck-preview-mode");
}

function cancel(event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function isEditorOverlay(target: Element | null) {
  return Boolean(target?.closest("[data-puck-overlay-portal]"));
}

/**
 * Keep Puck's block root as the selection and drag surface while allowing
 * audited passive source descendants to receive their native hover stream.
 * This listener never retargets or redispatches pointer movement.
 */
export function useProductionInteractionFirewall(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const hoverBlocks = new Set<Element>();
    const restorePassiveMousePropagation = (event: Event) => {
      const block = event.currentTarget as Element;
      const mode = previewMode(root);
      if (mode !== "edit" && mode !== "interactive") return;
      const policy = policyForBlock(block);
      if (mode === "interactive" || (policy && policyAllowsPassiveHover(policy))) {
        // Puck's own block hover listener stops mouseover/mouseout at the
        // block root. This listener is installed after it, so the original
        // browser event can continue to the source React delegation root.
        event.cancelBubble = false;
      }
    };
    const attachPassiveMousePropagation = () => {
      root.querySelectorAll("[data-puck-component]").forEach((block) => {
        if (hoverBlocks.has(block)) {
          // Puck can replace its native hover listener when a block remounts.
          // Re-append ours so it remains the final same-node listener without
          // changing the event target or creating a second event path.
          block.removeEventListener("mouseover", restorePassiveMousePropagation);
          block.removeEventListener("mouseout", restorePassiveMousePropagation);
        } else {
          hoverBlocks.add(block);
        }
        block.addEventListener("mouseover", restorePassiveMousePropagation);
        block.addEventListener("mouseout", restorePassiveMousePropagation);
      });
    };
    attachPassiveMousePropagation();
    const view = root.ownerDocument.defaultView;
    const deferredAttach = view?.setTimeout(attachPassiveMousePropagation, 0);
    const observer = view?.MutationObserver
      ? new view.MutationObserver(attachPassiveMousePropagation)
      : null;
    observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-puck-component"] });

    const onAuthoringEvent = (event: Event) => {
      if (!isAuthoringEdit(root)) return;
      const target = eventElement(event.target);
      const block = blockForTarget(root, event.target);
      if (!target || !block || !isDescendantTarget(block, target) || isEditorOverlay(target)) return;

      const policy = policyForBlock(block);
      if (!policy) return;

      if (event.type === "click" || event.type === "auxclick" || event.type === "dblclick") {
        if (!policyReservesClick(policy)) return;
        cancel(event);
        if (event.type === "click") {
          // Re-enter only the Puck root's native selection listener. The
          // source descendant never receives the original activating click.
          (block as HTMLElement).click();
        }
        return;
      }

      if (event.type === "submit") {
        if (policyReservesForm(policy)) cancel(event);
        return;
      }

      if (event.type === "focusin") {
        if (!policyReservesForm(policy) || !target.matches(FORM_SELECTOR)) return;
        cancel(event);
        (target as HTMLElement).blur();
        return;
      }

      if (event.type === "beforeinput" || event.type === "input" || event.type === "change") {
        if (policyReservesForm(policy) && target.matches(FORM_SELECTOR)) cancel(event);
        return;
      }

      if (event.type === "keydown") {
        const key = (event as KeyboardEvent).key;
        if (policyReservesForm(policy) && target.matches(FORM_SELECTOR)) {
          cancel(event);
        } else if (
          policyReservesClick(policy)
          && (key === "Enter" || key === " ")
          && target.matches(ACTION_SELECTOR)
        ) {
          cancel(event);
        }
        return;
      }

      if (event.type === "pointerdown" || event.type === "mousedown" || event.type === "touchstart") {
        const actionTarget = target.closest(ACTION_SELECTOR);
        // Keep the native click sequence alive so the click firewall can
        // synthesize selection on the block root. Stopping this source event
        // is enough to prevent descendant pointer handlers and capture.
        if (policyReservesClick(policy) && actionTarget && block.contains(actionTarget)) {
          event.stopImmediatePropagation();
        }
        if (policyReservesForm(policy) && target.matches(FORM_SELECTOR)) {
          event.stopImmediatePropagation();
        }
        if (policyReservesDrag(policy)) event.stopImmediatePropagation();
      }
    };

    AUTHORING_EVENTS.forEach((type) => root.addEventListener(type, onAuthoringEvent, true));
    return () => {
      AUTHORING_EVENTS.forEach((type) => root.removeEventListener(type, onAuthoringEvent, true));
      if (deferredAttach !== undefined) view?.clearTimeout(deferredAttach);
      observer?.disconnect();
      hoverBlocks.forEach((block) => {
        block.removeEventListener("mouseover", restorePassiveMousePropagation);
        block.removeEventListener("mouseout", restorePassiveMousePropagation);
      });
    };
  }, [rootRef]);
}
