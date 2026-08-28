export const LOCATIONS = [
  "Glavni ulaz",
  "Zadnja vrata",
  "Dnevna soba",
  "Kuhinja",
  "Garaža",
  "Hodnik",
  "Spavaća soba",
  "Dvorište",
  "Podrum",
  "Balkon",
];

export function pickRandomLocation(): string {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}