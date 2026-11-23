export const formatMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatTaka = (n) => `৳${formatMoney(n)}`;

export const formatCompact = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatDateShort = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export const monthLabel = (iso) => {
  if (!iso) return "—";
  const [y, m] = iso.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};