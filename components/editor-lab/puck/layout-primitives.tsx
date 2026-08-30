"use client";

import { DropZone, type Config } from "@puckeditor/core";

const editingPadding = (isEditing: boolean) => (isEditing ? "16px" : undefined);
type LayoutPuckProps = {
  puck?: { isEditing?: boolean };
  columns?: number;
  rows?: number;
  direction?: "row" | "column";
  wrap?: "nowrap" | "wrap";
};

export const layoutComponents = {
  Grid: {
    fields: {
      columns: { type: "number", label: "Columns", min: 1, max: 12 },
      rows: { type: "number", label: "Rows", min: 1, max: 12 },
    },
    defaultProps: { columns: 3, rows: 1 },
    render: ({ columns = 3, rows = 1, puck }: LayoutPuckProps) => (
      <DropZone
        zone="grid-zone"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns || 1}, 1fr)`,
          gridTemplateRows: `repeat(${rows || 1}, auto)`,
          padding: editingPadding(Boolean(puck?.isEditing)),
        }}
      />
    ),
  },
  Flex: {
    fields: {
      direction: {
        type: "select",
        label: "Direction",
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      wrap: {
        type: "select",
        label: "Wrap",
        options: [
          { label: "No wrap", value: "nowrap" },
          { label: "Wrap", value: "wrap" },
        ],
      },
    },
    defaultProps: { direction: "row", wrap: "wrap" },
    render: ({ direction = "row", wrap = "wrap", puck }: LayoutPuckProps) => (
      <DropZone
        zone="flex-zone"
        collisionAxis={direction === "column" ? "y" : "x"}
        style={{
          display: "flex",
          flexDirection: direction,
          flexWrap: wrap,
          padding: editingPadding(Boolean(puck?.isEditing)),
        }}
      />
    ),
  },
} satisfies Config["components"];
