export enum ActionPopUpRenderingComponents {
  Comment = 1,
  SolutionText = 2,
  SpecificPerson = 3
}

export const WORKFLOW_POPUP_COMPONENT_OPTIONS = [
  { label: 'Comment', value: ActionPopUpRenderingComponents.Comment },
  { label: 'Solution', value: ActionPopUpRenderingComponents.SolutionText },
  { label: 'Specific person', value: ActionPopUpRenderingComponents.SpecificPerson }
];

const POPUP_NAME_TO_ID: Record<string, ActionPopUpRenderingComponents> = {
  comment: ActionPopUpRenderingComponents.Comment,
  solution: ActionPopUpRenderingComponents.SolutionText,
  solutiontext: ActionPopUpRenderingComponents.SolutionText,
  specificperson: ActionPopUpRenderingComponents.SpecificPerson,
  specificpersonuser: ActionPopUpRenderingComponents.SpecificPerson
};

function parsePopupToken(token: string): number | null {
  const t = token.trim();
  if (!t) return null;
  const n = Number(t);
  if (Number.isInteger(n) && n >= 1 && n <= 3) return n;
  const key = t.replace(/\s+/g, '').toLowerCase();
  return POPUP_NAME_TO_ID[key] ?? null;
}

export function parsePopupComponentIds(raw?: string | null): number[] {
  if (!raw?.trim()) return [];
  const ids: number[] = [];
  for (const part of raw.split(',')) {
    const id = parsePopupToken(part);
    if (id != null && !ids.includes(id)) ids.push(id);
  }
  return ids.sort((a, b) => a - b);
}

export function popupComponentIdsToStorage(ids: number[] | null | undefined): string | null {
  if (!ids?.length) return null;
  const valid = [...new Set(ids.filter((x) => x >= 1 && x <= 3))].sort((a, b) => a - b);
  return valid.length ? valid.join(',') : null;
}
