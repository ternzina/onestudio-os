export const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDimensions = (width: number | null, height: number | null) => {
  if (!width || !height) return "—";
  return `${width} × ${height}`;
};

export const getOrientation = (width: number | null, height: number | null) => {
  if (!width || !height) return "unknown";
  const difference = Math.abs(width - height);
  if (difference <= Math.max(width, height) * 0.04) return "square";
  return width > height ? "landscape" : "portrait";
};

export const getOrientationLabel = (width: number | null, height: number | null) => {
  const orientation = getOrientation(width, height);
  if (orientation === "portrait") return "Вертикаль";
  if (orientation === "landscape") return "Горизонталь";
  if (orientation === "square") return "Квадрат";
  return "—";
};

export const isVideoMedia = (mimeType: string | null) =>
  Boolean(mimeType?.toLowerCase().startsWith("video/"));

export const getMediaTypeLabel = (mimeType: string | null) =>
  isVideoMedia(mimeType) ? "Видео" : "Фото";
