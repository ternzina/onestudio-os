"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Menu,
  Package,
  Receipt,
  Route,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: Math.ceil(scrollTop + clientHeight) < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const focusInset =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color] duration-150 ease-out";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TOOLTIP_DELAY_MS = 400;
const TOOLTIP_GRACE_MS = 300;

type Tone = "neutral" | "attention" | "critical";

const DOT: Record<Tone, string> = {
  neutral: "bg-neutral-300 dark:bg-neutral-600",
  attention: "bg-amber-500",
  critical: "bg-red-500",
};

type Row = {
  name: string;
  detail: string;
  meta: string;
  status: string;
  tone: Tone;
};

type Group = {
  label: string;
  items: { label: string; count?: string }[];
};

type Area = {
  id: string;
  label: string;
  icon: LucideIcon;
  current: string;
  groups: Group[];
  title: string;
  action: string;
  listTitle: string;
  listCount: string;
  rows: Row[];
};

const WORKSPACES = [
  { name: "Kestrel Freight", members: "24 members" },
  { name: "Kestrel Freight Europe", members: "9 members" },
  { name: "Pinnacle 3PL Partners", members: "6 members" },
];

const AREAS: Area[] = [
  {
    id: "shipments",
    label: "Shipments",
    icon: Package,
    current: "All shipments",
    title: "Shipments",
    action: "New shipment",
    listTitle: "All shipments",
    listCount: "312",
    groups: [
      {
        label: "Shipments",
        items: [
          { label: "All shipments", count: "312" },
          { label: "In transit", count: "48" },
          { label: "Awaiting pickup", count: "12" },
          { label: "Delayed", count: "5" },
          { label: "Delivered" },
          { label: "Cancelled" },
        ],
      },
      {
        label: "Saved views",
        items: [
          { label: "Northeast lane" },
          { label: "Reefer loads" },
          { label: "High-value cargo" },
          { label: "Missing paperwork" },
          { label: "Customs hold" },
          { label: "Weekend departures" },
        ],
      },
      {
        label: "Reference",
        items: [
          { label: "Service map" },
          { label: "Rate table" },
          { label: "Documents" },
          { label: "Exception log" },
          { label: "Carrier directory" },
          { label: "Archive" },
        ],
      },
    ],
    rows: [
      {
        name: "Halvorsen Cold Chain Logistics AB",
        detail: "KF-40218 · Newark → Montréal",
        meta: "14 Mar",
        status: "In transit",
        tone: "neutral",
      },
      {
        name: "Brightwater Foods",
        detail: "KF-40211 · Savannah → Atlanta",
        meta: "13 Mar",
        status: "Delivered",
        tone: "neutral",
      },
      {
        name: "Ardent Medical Supply",
        detail: "KF-40207 · Houston → El Paso",
        meta: "14 Mar",
        status: "Delayed",
        tone: "attention",
      },
      {
        name: "Corriveau Frères Distribution",
        detail: "KF-40233 · Detroit → Windsor",
        meta: "15 Mar",
        status: "Customs hold",
        tone: "attention",
      },
      {
        name: "Pinewood Building Products",
        detail: "KF-40199 · Portland → Boise",
        meta: "12 Mar",
        status: "Delivered",
        tone: "neutral",
      },
      {
        name: "Northgate Appliance",
        detail: "KF-40241 · Chicago → Omaha",
        meta: "-",
        status: "Awaiting pickup",
        tone: "neutral",
      },
      {
        name: "Lakeshore Beverage Co.",
        detail: "KF-40188 · Milwaukee → Fargo",
        meta: "16 Mar",
        status: "In transit",
        tone: "neutral",
      },
      {
        name: "Sable & Finch Furnishings",
        detail: "KF-40250 · Charlotte → Richmond",
        meta: "15 Mar",
        status: "Failed delivery",
        tone: "critical",
      },
      {
        name: "Tamarack Paper Mills",
        detail: "KF-40176 · Duluth → Sioux Falls",
        meta: "13 Mar",
        status: "Delivered",
        tone: "neutral",
      },
      {
        name: "Ridgeline Auto Parts",
        detail: "KF-40262 · Reno → Sacramento",
        meta: "16 Mar",
        status: "In transit",
        tone: "neutral",
      },
      {
        name: "Meridian Home Goods",
        detail: "KF-40255 · Tampa → Mobile",
        meta: "17 Mar",
        status: "Awaiting pickup",
        tone: "neutral",
      },
    ],
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: Route,
    current: "Load board",
    title: "Load board",
    action: "Assign driver",
    listTitle: "Open loads",
    listCount: "61",
    groups: [
      {
        label: "Dispatch",
        items: [
          { label: "Load board", count: "61" },
          { label: "Assigned", count: "26" },
          { label: "Needs a driver", count: "9" },
          { label: "Check-ins" },
          { label: "Route changes", count: "4" },
          { label: "Detention" },
        ],
      },
      {
        label: "Saved views",
        items: [
          { label: "Same-day pickups" },
          { label: "Owner-operators" },
          { label: "Hazmat certified" },
          { label: "Backhaul candidates" },
          { label: "Weekend coverage" },
          { label: "Night shift" },
        ],
      },
      {
        label: "Reference",
        items: [
          { label: "Driver roster" },
          { label: "Terminal hours" },
          { label: "Fuel stops" },
          { label: "Escalation policy" },
          { label: "Shift log" },
          { label: "Archive" },
        ],
      },
    ],
    rows: [
      {
        name: "Newark → Montréal",
        detail: "DX-8841 · Reefer · Ivo Petrenko",
        meta: "14 Mar",
        status: "Assigned",
        tone: "neutral",
      },
      {
        name: "Houston → El Paso",
        detail: "DX-8846 · Dry van · no driver yet",
        meta: "14 Mar",
        status: "Needs a driver",
        tone: "attention",
      },
      {
        name: "Savannah → Atlanta",
        detail: "DX-8829 · Dry van · Rosalind Achebe-Whitfield",
        meta: "13 Mar",
        status: "Assigned",
        tone: "neutral",
      },
      {
        name: "Portland → Boise",
        detail: "DX-8852 · Flatbed · Marcus Oyelaran",
        meta: "15 Mar",
        status: "Tendered",
        tone: "neutral",
      },
      {
        name: "Chicago → Omaha",
        detail: "DX-8858 · Dry van · no driver yet",
        meta: "-",
        status: "Needs a driver",
        tone: "attention",
      },
      {
        name: "Detroit → Windsor",
        detail: "DX-8837 · Reefer · Anneke Vos",
        meta: "15 Mar",
        status: "Running late",
        tone: "attention",
      },
      {
        name: "Milwaukee → Fargo",
        detail: "DX-8863 · Dry van · Dario Esposito",
        meta: "16 Mar",
        status: "Assigned",
        tone: "neutral",
      },
      {
        name: "Charlotte → Richmond",
        detail: "DX-8871 · Flatbed · Priya Raghunathan",
        meta: "15 Mar",
        status: "Refused",
        tone: "critical",
      },
      {
        name: "Duluth → Sioux Falls",
        detail: "DX-8818 · Dry van · Colm Brennan",
        meta: "13 Mar",
        status: "Assigned",
        tone: "neutral",
      },
      {
        name: "Reno → Sacramento",
        detail: "DX-8880 · Reefer · Yolanda Cruz",
        meta: "16 Mar",
        status: "Tendered",
        tone: "neutral",
      },
      {
        name: "Tampa → Mobile",
        detail: "DX-8884 · Dry van · Henrik Lund",
        meta: "17 Mar",
        status: "Assigned",
        tone: "neutral",
      },
    ],
  },
  {
    id: "fleet",
    label: "Fleet",
    icon: Truck,
    current: "All units",
    title: "Fleet",
    action: "Add unit",
    listTitle: "All units",
    listCount: "184",
    groups: [
      {
        label: "Fleet",
        items: [
          { label: "All units", count: "184" },
          { label: "In service", count: "151" },
          { label: "In shop", count: "7" },
          { label: "Idle", count: "22" },
          { label: "Out of service", count: "4" },
          { label: "Retired" },
        ],
      },
      {
        label: "Saved views",
        items: [
          { label: "Reefer trailers" },
          { label: "Due for inspection" },
          { label: "High idle time" },
          { label: "Out of region" },
          { label: "Leased units" },
          { label: "Fuel outliers" },
        ],
      },
      {
        label: "Reference",
        items: [
          { label: "Maintenance plans" },
          { label: "Parts inventory" },
          { label: "Warranty claims" },
          { label: "Fuel cards" },
          { label: "Compliance log" },
          { label: "Archive" },
        ],
      },
    ],
    rows: [
      {
        name: "Unit 2141",
        detail: "Freightliner Cascadia · Ivo Petrenko",
        meta: "22 Mar",
        status: "In service",
        tone: "neutral",
      },
      {
        name: "Unit 2158",
        detail: "Kenworth T680 · Rosalind Achebe-Whitfield",
        meta: "04 Apr",
        status: "In service",
        tone: "neutral",
      },
      {
        name: "Unit 1907",
        detail: "Volvo VNL 760 · Marcus Oyelaran",
        meta: "18 Mar",
        status: "Inspection due",
        tone: "attention",
      },
      {
        name: "Trailer R-4412",
        detail: "Utility 3000R reefer · pool unit",
        meta: "27 Mar",
        status: "Idle",
        tone: "neutral",
      },
      {
        name: "Unit 2203",
        detail: "Peterbilt 579 · Anneke Vos",
        meta: "-",
        status: "In shop",
        tone: "attention",
      },
      {
        name: "Trailer D-8820",
        detail: "Wabash DuraPlate dry van · pool unit",
        meta: "09 Apr",
        status: "In service",
        tone: "neutral",
      },
      {
        name: "Unit 1864",
        detail: "International LT · Colm Brennan",
        meta: "16 Mar",
        status: "Out of service",
        tone: "critical",
      },
      {
        name: "Unit 2177",
        detail: "Mack Anthem · Dario Esposito",
        meta: "31 Mar",
        status: "In service",
        tone: "neutral",
      },
      {
        name: "Trailer F-2290",
        detail: "Fontaine Infinity flatbed · pool unit",
        meta: "12 Apr",
        status: "Idle",
        tone: "neutral",
      },
      {
        name: "Unit 2195",
        detail: "Freightliner Cascadia · Priya Raghunathan",
        meta: "25 Mar",
        status: "In service",
        tone: "neutral",
      },
      {
        name: "Unit 2088",
        detail: "Kenworth T680 · Yolanda Cruz",
        meta: "07 Apr",
        status: "In service",
        tone: "neutral",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Building2,
    current: "All accounts",
    title: "Customers",
    action: "Add customer",
    listTitle: "All accounts",
    listCount: "96",
    groups: [
      {
        label: "Customers",
        items: [
          { label: "All accounts", count: "96" },
          { label: "Active", count: "78" },
          { label: "Onboarding", count: "4" },
          { label: "At risk", count: "3" },
          { label: "Past due", count: "5" },
          { label: "Closed" },
        ],
      },
      {
        label: "Saved views",
        items: [
          { label: "Enterprise accounts" },
          { label: "Contract renewals" },
          { label: "Volume commitments" },
          { label: "Missing tax ID" },
          { label: "Referral sources" },
          { label: "Dormant 90 days" },
        ],
      },
      {
        label: "Reference",
        items: [
          { label: "Contacts" },
          { label: "Contracts" },
          { label: "Service levels" },
          { label: "Credit limits" },
          { label: "Account notes" },
          { label: "Archive" },
        ],
      },
    ],
    rows: [
      {
        name: "Halvorsen Cold Chain Logistics AB",
        detail: "Nordics · Iris Renner",
        meta: "18 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Brightwater Foods",
        detail: "Southeast · Theo Amankwah",
        meta: "24 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Ardent Medical Supply",
        detail: "Gulf Coast · Iris Renner",
        meta: "6 open",
        status: "At risk",
        tone: "attention",
      },
      {
        name: "Corriveau Frères Distribution",
        detail: "Great Lakes · Marguerite Vaillancourt",
        meta: "11 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Pinewood Building Products",
        detail: "Pacific Northwest · Theo Amankwah",
        meta: "9 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Northgate Appliance",
        detail: "Midwest · owner not set",
        meta: "-",
        status: "Onboarding",
        tone: "neutral",
      },
      {
        name: "Lakeshore Beverage Co.",
        detail: "Upper Midwest · Marguerite Vaillancourt",
        meta: "14 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Sable & Finch Furnishings",
        detail: "Mid-Atlantic · Iris Renner",
        meta: "3 open",
        status: "Past due",
        tone: "critical",
      },
      {
        name: "Tamarack Paper Mills",
        detail: "Northern Plains · Theo Amankwah",
        meta: "7 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Ridgeline Auto Parts",
        detail: "Mountain West · Marguerite Vaillancourt",
        meta: "12 open",
        status: "Active",
        tone: "neutral",
      },
      {
        name: "Meridian Home Goods",
        detail: "Southeast · Iris Renner",
        meta: "2 open",
        status: "At risk",
        tone: "attention",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: Receipt,
    current: "All invoices",
    title: "Billing",
    action: "Create invoice",
    listTitle: "Open invoices",
    listCount: "119",
    groups: [
      {
        label: "Billing",
        items: [
          { label: "All invoices", count: "438" },
          { label: "Draft", count: "12" },
          { label: "Sent", count: "96" },
          { label: "Overdue", count: "11" },
          { label: "Paid" },
          { label: "Credit notes" },
        ],
      },
      {
        label: "Saved views",
        items: [
          { label: "Over 60 days" },
          { label: "Disputed charges" },
          { label: "Accessorial review" },
          { label: "Auto-pay accounts" },
          { label: "Unbilled loads" },
          { label: "Fuel surcharges" },
        ],
      },
      {
        label: "Reference",
        items: [
          { label: "Rate agreements" },
          { label: "Tax profiles" },
          { label: "Payment methods" },
          { label: "Remittance advice" },
          { label: "Export history" },
          { label: "Archive" },
        ],
      },
    ],
    rows: [
      {
        name: "Halvorsen Cold Chain Logistics AB",
        detail: "INV-20418 · issued 02 Mar",
        meta: "$18,240.00",
        status: "Sent",
        tone: "neutral",
      },
      {
        name: "Brightwater Foods",
        detail: "INV-20421 · issued 03 Mar",
        meta: "$7,905.50",
        status: "Paid",
        tone: "neutral",
      },
      {
        name: "Ardent Medical Supply",
        detail: "INV-20388 · issued 12 Jan",
        meta: "$12,480.00",
        status: "Overdue",
        tone: "attention",
      },
      {
        name: "Corriveau Frères Distribution",
        detail: "INV-20430 · issued 05 Mar",
        meta: "$4,116.25",
        status: "Sent",
        tone: "neutral",
      },
      {
        name: "Pinewood Building Products",
        detail: "INV-20399 · issued 21 Feb",
        meta: "$9,760.00",
        status: "Paid",
        tone: "neutral",
      },
      {
        name: "Northgate Appliance",
        detail: "INV-20444 · not issued yet",
        meta: "-",
        status: "Draft",
        tone: "neutral",
      },
      {
        name: "Lakeshore Beverage Co.",
        detail: "INV-20407 · issued 26 Feb",
        meta: "$21,318.75",
        status: "Sent",
        tone: "neutral",
      },
      {
        name: "Sable & Finch Furnishings",
        detail: "INV-20362 · issued 04 Jan",
        meta: "$6,540.00",
        status: "Disputed",
        tone: "critical",
      },
      {
        name: "Tamarack Paper Mills",
        detail: "INV-20375 · issued 18 Jan",
        meta: "$3,289.40",
        status: "Overdue",
        tone: "attention",
      },
      {
        name: "Ridgeline Auto Parts",
        detail: "INV-20436 · issued 06 Mar",
        meta: "$15,072.00",
        status: "Sent",
        tone: "neutral",
      },
      {
        name: "Meridian Home Goods",
        detail: "INV-20441 · issued 07 Mar",
        meta: "$2,845.10",
        status: "Sent",
        tone: "neutral",
      },
    ],
  },
];

function WorkspaceSwitcher() {
  const [workspace, setWorkspace] = useState(WORKSPACES[0].name);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setShown(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => {
      setShown(true);
      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitemradio"]')
        ?.focus({ preventScroll: true });
    });

    const onPointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShown(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitemradio"], [role="menuitem"]',
        ) ?? [],
      );
      if (items.length === 0) return;
      const index = items.indexOf(doc.activeElement as HTMLElement);
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        items[index < 0 || index === items.length - 1 ? 0 : index + 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[index <= 0 ? items.length - 1 : index - 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus({ preventScroll: true });
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus({ preventScroll: true });
      } else if (event.key === "Tab") {
        setOpen(false);
        setShown(false);
      }
    };

    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = WORKSPACES.find((item) => item.name === workspace);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(false) : setOpen(true))}
        className={cx(
          "flex h-11 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 px-2 text-left hover:bg-neutral-200 active:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:active:bg-neutral-700",
          transition,
          focus,
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-300 text-xs font-medium text-neutral-700 dark:bg-neutral-600 dark:text-neutral-100">
          {workspace.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            {workspace}
          </span>
          <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
            {active?.members}
          </span>
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Switch workspace"
          className={cx(
            "absolute left-0 right-0 top-[calc(100%+0.25rem)] z-30 origin-top rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {WORKSPACES.map((item) => (
            <button
              key={item.name}
              type="button"
              role="menuitemradio"
              aria-checked={item.name === workspace}
              onClick={() => {
                setWorkspace(item.name);
                close(true);
              }}
              className={cx(
                "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-2 py-1.5 text-left hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
                transition,
                focusInset,
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {item.name}
                </span>
                <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                  {item.members}
                </span>
              </span>
              {item.name === workspace && (
                <Check
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-neutral-900 dark:text-neutral-100"
                />
              )}
            </button>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => close(true)}
            className={cx(
              "mt-1 flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
              transition,
              focusInset,
            )}
          >
            Add workspace
          </button>
        </div>
      )}
    </div>
  );
}

function NavigationFrame({
  areaId,
  onSelectArea,
  onClose,
}: {
  areaId: string;
  onSelectArea: (id: string) => void;
  onClose?: () => void;
}) {
  const [tipFor, setTipFor] = useState<string | null>(null);
  const [tipShown, setTipShown] = useState(false);
  const nav = useScrollFade<HTMLElement>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const openRef = useRef(false);
  const graceRef = useRef(false);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const reduceMotion = useReducedMotion();

  const area = AREAS.find((item) => item.id === areaId) ?? AREAS[0];

  const showTip = (id: string) => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(frameRef.current ?? 0);
    const instant = openRef.current || graceRef.current;
    const reveal = () => {
      openRef.current = true;
      setTipFor(id);
      if (instant) {
        setTipShown(true);
      } else {
        setTipShown(false);
        frameRef.current = requestAnimationFrame(() => setTipShown(true));
      }
    };
    if (instant) reveal();
    else timerRef.current = setTimeout(reveal, TOOLTIP_DELAY_MS);
  };

  const hideTip = () => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(frameRef.current ?? 0);
    if (openRef.current) {
      graceRef.current = true;
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = setTimeout(() => {
        graceRef.current = false;
      }, TOOLTIP_GRACE_MS);
    }
    openRef.current = false;
    setTipFor(null);
    setTipShown(false);
  };

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      clearTimeout(graceTimerRef.current);
      cancelAnimationFrame(frameRef.current ?? 0);
    },
    [],
  );

  const tip = (id: string, label: string) =>
    tipFor === id ? (
      <span
        role="tooltip"
        className={cx(
          "pointer-events-none absolute left-full top-1/2 z-[70] ml-2 flex h-7 origin-left -translate-y-1/2 items-center whitespace-nowrap rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2 text-xs text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[opacity,transform] duration-[125ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
          tipShown ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {label}
      </span>
    ) : null;

  return (
    <>
      <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-neutral-200/70 bg-neutral-50 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        {onClose && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className={cx(
              "mb-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
              transition,
              focus,
            )}
          >
            <X aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>
        )}

        <nav
          aria-label="Areas"
          onMouseLeave={hideTip}
          className="flex flex-col items-center gap-1"
        >
          {AREAS.map((item) => {
            const Icon = item.icon;
            const selected = item.id === areaId;
            return (
              <span key={item.id} className="relative">
                <button
                  type="button"
                  aria-label={item.label}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => {
                    onSelectArea(item.id);
                    hideTip();
                  }}
                  onMouseEnter={() => showTip(item.id)}
                  onFocus={() => showTip(item.id)}
                  onBlur={hideTip}
                  className={cx(
                    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)]",
                    selected
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                      : "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
                    transition,
                    focus,
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                {tip(item.id, item.label)}
              </span>
            );
          })}
        </nav>

        <span className="relative mt-auto" onMouseLeave={hideTip}>
          <button
            type="button"
            aria-label="Marta Kowalczyk, dispatch manager"
            onMouseEnter={() => showTip("account")}
            onFocus={() => showTip("account")}
            onBlur={hideTip}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-300 active:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600 dark:active:bg-neutral-600",
              transition,
              focus,
            )}
          >
            MK
          </button>
          {tip("account", "Marta Kowalczyk")}
        </span>
      </div>

      <div className="flex w-64 min-w-0 flex-col bg-neutral-50 dark:bg-neutral-900">
        <div className="shrink-0 px-2 pb-1 pt-2">
          <WorkspaceSwitcher />
        </div>

        <div className="relative min-h-0 flex-1">
          <nav
            ref={nav.ref}
            onScroll={nav.onScroll}
            aria-label={area.label}
            className="h-full overflow-y-auto px-2 pb-3"
          >
            <motion.div
              key={area.id}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="space-y-4"
            >
              {area.groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const current = item.label === area.current;
                      return (
                        <li key={item.label}>
                          <a
                            href={`#${area.id}`}
                            aria-current={current ? "page" : undefined}
                            className={cx(
                              "flex h-8 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                              current
                                ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                              transition,
                              focus,
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {item.label}
                            </span>
                            {item.count && (
                              <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                                {item.count}
                              </span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </motion.div>
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </>
  );
}

export default function AppShell2() {
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerShown, setDrawerShown] = useState(false);
  const content = useScrollFade<HTMLElement>();
  const shouldFocusRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const area = AREAS.find((item) => item.id === areaId) ?? AREAS[0];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const view = rootRef.current?.ownerDocument.defaultView ?? window;
      if (view.matchMedia("(max-width: 1023px)").matches) setDrawerOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const doc = drawer?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => setDrawerShown(true));

    const getFocusable = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));

    if (shouldFocusRef.current) {
      getFocusable()[0]?.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setDrawerShown(false);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    doc.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerShown(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-white dark:bg-neutral-950"
    >
      <aside className="hidden shrink-0 lg:flex">
        <NavigationFrame areaId={areaId} onSelectArea={setAreaId} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200/70 px-4 sm:px-6 dark:border-neutral-800">
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => {
              shouldFocusRef.current = true;
              setDrawerOpen(true);
            }}
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-200 lg:hidden dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:active:bg-neutral-700",
              transition,
              focus,
            )}
          >
            <Menu aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
            {area.title}
          </h1>

          <button
            type="button"
            className={cx(
              "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2.5 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] motion-reduce:active:scale-100 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              focus,
            )}
          >
            {area.action}
          </button>
        </header>

        <div className="relative min-h-0 flex-1">
          <main
            ref={content.ref}
            onScroll={content.onScroll}
            className="h-full overflow-y-auto p-4 sm:p-6"
          >
            <motion.div
              key={area.id}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex h-12 items-center gap-3 bg-neutral-50 px-4 dark:bg-neutral-800/40">
                <h2 className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {area.listTitle}
                </h2>
                <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                  {area.listCount}
                </span>
              </div>

              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
                {area.rows.map((row) => (
                  <li key={row.name}>
                    <button
                      type="button"
                      className={cx(
                        "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800",
                        transition,
                        focusInset,
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                          {row.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-500">
                          {row.detail}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end">
                        <span
                          className={cx(
                            "block text-[13px] tabular-nums",
                            row.meta === "-"
                              ? "text-neutral-400 dark:text-neutral-600"
                              : "text-neutral-900 dark:text-neutral-100",
                          )}
                        >
                          {row.meta}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-500">
                          <span
                            aria-hidden="true"
                            className={cx(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              DOT[row.tone],
                            )}
                          />
                          {row.status}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </main>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              content.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              content.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>

      {drawerOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            tabIndex={-1}
            onClick={closeDrawer}
            className={cx(
              "absolute inset-0 z-30 cursor-pointer bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-950/60",
              drawerShown ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-[312px] max-w-[calc(100%-3rem)] overflow-hidden rounded-r-[var(--rb-r-4xl,18px)] bg-neutral-50 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-neutral-900 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              drawerShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <NavigationFrame
              areaId={areaId}
              onSelectArea={setAreaId}
              onClose={closeDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
