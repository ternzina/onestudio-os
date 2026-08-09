"use client";

export const editorCompactFieldClass = "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9a742e] disabled:opacity-50";

export function EditorToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-xs font-semibold">{label}<input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /></label>;
}
