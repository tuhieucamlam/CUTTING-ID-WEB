// ─── Pivot Calculation Utilities ──────────────────────────────────────────

/**
 * Sort sizes: numeric descending, half-sizes (T suffix) after their whole-size peer.
 * e.g.: 15, 14, 13, 12T, 12, 11T, 11, 10T, 10, 9T, 9, 8T, 8, 7T, 7, 6T, 6
 */
export function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (numB !== numA) return numB - numA; // larger size first
    // same numeric → half-size (T) comes BEFORE whole at same number in image
    const aT = a.toString().endsWith('T');
    const bT = b.toString().endsWith('T');
    if (aT && !bT) return -1;
    if (!aT && bT) return 1;
    return 0;
  });
}

/**
 * Build pivot data structure from filtered rows.
 *
 * Returns:
 * {
 *   materials: [{ label, colorCodes }],   // ordered unique materials + their color codes
 *   sizes: [],                             // ordered unique sizes
 *   cells: {                               // cells[size][material][colorCode] = qty
 *     [size]: { gTotal, [material]: { matTotal, [colorCode]: qty } }
 *   },
 *   totals: {                              // column totals
 *     gTotal,
 *     [material]: { matTotal, [colorCode]: qty }
 *   }
 * }
 */
export function buildPivot(rows) {
  const materialMap = new Map(); // material → Set<colorCode>
  const sizeSet = new Set();

  rows.forEach(r => {
    sizeSet.add(r.size);
    if (!materialMap.has(r.material)) materialMap.set(r.material, new Set());
    materialMap.get(r.material).add(r.colorCode);
  });

  // Build ordered structures
  const materials = Array.from(materialMap.entries()).map(([label, codes]) => ({
    label,
    colorCodes: Array.from(codes).sort(),
  }));

  const sizes = sortSizes(Array.from(sizeSet));

  // Init cells
  const cells = {};
  sizes.forEach(s => {
    cells[s] = { gTotal: 0 };
    materials.forEach(m => {
      cells[s][m.label] = { matTotal: 0 };
      m.colorCodes.forEach(cc => { cells[s][m.label][cc] = 0; });
    });
  });

  // Init totals
  const totals = { gTotal: 0 };
  materials.forEach(m => {
    totals[m.label] = { matTotal: 0 };
    m.colorCodes.forEach(cc => { totals[m.label][cc] = 0; });
  });

  // Accumulate
  rows.forEach(r => {
    const { size, material, colorCode, qty } = r;
    if (!cells[size]) return;
    if (!cells[size][material]) return;

    cells[size].gTotal += qty;
    cells[size][material].matTotal += qty;
    if (cells[size][material][colorCode] !== undefined) {
      cells[size][material][colorCode] += qty;
    } else {
      cells[size][material][colorCode] = qty;
    }

    totals.gTotal += qty;
    totals[material].matTotal += qty;
    if (totals[material][colorCode] !== undefined) {
      totals[material][colorCode] += qty;
    } else {
      totals[material][colorCode] = qty;
    }
  });

  return { materials, sizes, cells, totals };
}

/** Format a date string YYYYMMDD → YYYY/MM/DD (YYYY-MM-DD) */
export function formatPlanDate(d) {
  if (!d || d.length !== 8) return d;
  return `${d.slice(0,4)}/${d.slice(4,6)}/${d.slice(6,8)}`;
}

/** Parse YYYY-MM-DD input value → YYYYMMDD key */
export function inputToKey(v) {
  return v.replace(/-/g, '');
}
