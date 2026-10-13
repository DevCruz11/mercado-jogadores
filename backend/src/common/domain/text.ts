const CONTROL_CHARACTERS = /\p{Cc}/u;
const COMBINING_MARKS = /\p{Mn}/gu;
const REPEATED_SPACES = / {2,}/g;
const EDGE_SPACES = /^ +| +$/g;
const LETTER = /\p{L}/u;

export function hasControlCharacters(text: string): boolean {
  return CONTROL_CHARACTERS.test(text);
}

export function collapseSpaces(text: string): string {
  return text.replace(REPEATED_SPACES, ' ').replace(EDGE_SPACES, '');
}

export function characterCount(text: string): number {
  return [...text].length;
}

export function countWords(text: string): number {
  return text.split(' ').filter((token) => LETTER.test(token)).length;
}

export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '');
}

export function foldForComparison(text: string): string {
  return removeAccents(text.toLowerCase());
}

export function compareByCodePoint(left: string, right: string): number {
  const leftPoints = [...left];
  const rightPoints = [...right];
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index++) {
    const difference = leftPoints[index].codePointAt(0)! - rightPoints[index].codePointAt(0)!;
    if (difference !== 0) {
      return difference;
    }
  }
  return leftPoints.length - rightPoints.length;
}

export function compareNames(left: string, right: string): number {
  return compareByCodePoint(foldForComparison(left), foldForComparison(right));
}
