const NEGATION_CUES =
  /\b(no|not|none|never|without|denies|denied|absent|negative\s+for|free\s+of|ruled\s+out|doesn't\s+have|does\s+not\s+have|don't\s+have|do\s+not\s+have|didn't\s+have|did\s+not\s+have|isn't|is\s+not|aren't|are\s+not)\b/i;

// FIX: Added 'is|are|was|were' to stop negation from bleeding across phrases like "...not breastfeeding and is lethargic"
const SCOPE_BREAKERS =
  /\b(but|however|though|although|yet|except|with|has|have|having|complains|complaining|reports|reporting|shows|showing|present|now|is|are|was|were)\b/i;

const POST_NEGATION =
  /^\s*(?::|-|is|are|was|were)?\s*\b(absent|none|negative|no|not\s+present|ruled\s+out)\b/i;

export function isNegated(text: string, matchStart: number, matchEnd: number): boolean {
  const windowStart = Math.max(0, matchStart - 60);
  const clauseParts = text.slice(windowStart, matchStart).split(/[.;!?,]/);
  const currentClauseBefore = clauseParts[clauseParts.length - 1];

  let lastNegMatch: RegExpExecArray | null = null;
  const negRegex = new RegExp(NEGATION_CUES.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = negRegex.exec(currentClauseBefore)) !== null) {
    lastNegMatch = m;
  }

  if (lastNegMatch) {
    const afterNegation = currentClauseBefore.slice(
      lastNegMatch.index + lastNegMatch[0].length,
    );
    if (!SCOPE_BREAKERS.test(afterNegation)) {
      return true;
    }
  }

  const afterSlice = text.slice(matchEnd, Math.min(text.length, matchEnd + 25));
  if (POST_NEGATION.test(afterSlice)) {
    return true;
  }

  return false;
}