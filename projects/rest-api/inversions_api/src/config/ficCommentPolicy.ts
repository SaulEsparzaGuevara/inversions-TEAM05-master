export interface FicCommentChecklistItem {
  id: string;
  description: string;
  required: boolean;
}

export interface FicCommentValidationResult {
  isCompliant: boolean;
  issues: string[];
}

export const FIC_COMMENT_CHECKLIST: FicCommentChecklistItem[] = [
  {
    id: "FIC-001",
    description: "Todo comentario de politica/implementacion futura usa prefijo '🧠 FIC:'",
    required: true
  },
  {
    id: "FIC-002",
    description: "Los comentarios FIC incluyen idioma o par EN/ES",
    required: true
  },
  {
    id: "FIC-003",
    description: "Cuando hay EN y ES separados, ambos aparecen en proximidad local",
    required: true
  }
];

function hasFicPrefix(line: string): boolean {
  return line.includes("🧠 FIC:");
}

function hasLanguageMarker(line: string): boolean {
  return line.includes("(EN)") || line.includes("(ES)") || line.includes("(EN/ES)");
}

export function validateFicCommentLines(lines: string[]): FicCommentValidationResult {
  const issues: string[] = [];

  lines.forEach((line, index) => {
    if (!line.includes("FIC:")) {
      return;
    }

    if (!hasFicPrefix(line)) {
      issues.push(`Line ${index + 1}: comentario FIC sin prefijo emoji esperado.`);
      return;
    }

    if (!hasLanguageMarker(line)) {
      issues.push(`Line ${index + 1}: comentario FIC sin marcador de idioma EN/ES.`);
    }
  });

  return {
    isCompliant: issues.length === 0,
    issues
  };
}
