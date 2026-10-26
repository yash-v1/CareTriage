const ONES_AND_TEENS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

function isNumberToken(word: string): boolean {
  return word in ONES_AND_TEENS || word in TENS || word === "hundred";
}

function evaluateNumberTokens(tokens: string[]): number[] {
  const results: number[] = [];
  let current: number | null = null;
  for (const token of tokens) {
    if (token === "hundred") {
      if (current === null) current = 100;
      else if (current >= 1 && current <= 9) current *= 100;
      else { results.push(current); current = 100; }
    } else if (token in TENS) {
      const val = TENS[token];
      if (current === null) current = val;
      else if (current === 1 || current === 2) current = current * 100 + val;
      else if (current >= 100 && current % 100 === 0) current += val;
      else { results.push(current); current = val; }
    } else if (token in ONES_AND_TEENS) {
      const val = ONES_AND_TEENS[token];
      if (current === null) current = val;
      else if (val === 10 && (current === 1 || current === 2)) current = current * 100 + 10;
      else if (val < 10 && current >= 20 && current % 10 === 0 && current % 100 !== 0) current += val;
      else if (current >= 100 && current % 100 === 0) current += val;
      else { results.push(current); current = val; }
    }
  }
  if (current !== null) results.push(current);
  return results;
}

export function replaceNumberWords(input: string): string {
  const normalized = input.replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 $2");
  const rawTokens = normalized.split(/(\s+|[^a-zA-Z0-9\s]+)/);
  const out: string[] = [];
  let i = 0;
  while (i < rawTokens.length) {
    const lower = rawTokens[i].toLowerCase();
    if (!isNumberToken(lower)) {
      out.push(rawTokens[i]);
      i++;
      continue;
    }
    const numWords: string[] = [lower];
    let j = i + 1;
    while (j < rawTokens.length) {
      if (/^\s+$/.test(rawTokens[j])) {
        const nextIdx = j + 1;
        if (nextIdx >= rawTokens.length) break;
        const nextLower = rawTokens[nextIdx].toLowerCase();
        if (isNumberToken(nextLower)) {
          numWords.push(nextLower);
          j = nextIdx + 1;
          continue;
        }
        if (nextLower === "and" && numWords[numWords.length - 1] === "hundred" && nextIdx + 2 < rawTokens.length && /^\s+$/.test(rawTokens[nextIdx + 1]) && isNumberToken(rawTokens[nextIdx + 2].toLowerCase())) {
          numWords.push(rawTokens[nextIdx + 2].toLowerCase());
          j = nextIdx + 3;
          continue;
        }
      }
      break;
    }
    out.push(evaluateNumberTokens(numWords).join(" "));
    i = j;
  }
  return out.join("");
}