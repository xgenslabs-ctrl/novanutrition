// Line icons for the stat cards (24×24, stroke = currentColor).
const P = {
  dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  bolt: '<path d="M13 2.5 4.5 13.5h6.5l-1 8 8.5-11h-6.5z"/>',
  flame: '<path d="M12 21.5c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-7.7.4 1.6 1.2 2.7 2.3 3.3.2-3.2 1.6-6 3.3-8.4.6 3.4 4.8 6.6 4.8 12.6 0 3.7-3.1 6.4-7.5 6.4z"/><path d="M12 21.5c-1.7 0-2.8-1.2-2.8-2.8 0-1.7 1.3-2.6 2.1-4 .9 1.3 3.5 2.2 3.5 4.1 0 1.6-1.2 2.7-2.8 2.7z"/>',
  cube: '<path d="M12 2.5 3.5 7v10l8.5 4.5 8.5-4.5V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10"/>',
  wheat: '<path d="M12 22V9"/><path d="M12 9c-2.5 0-4-1.8-4-4.5 2.5 0 4 1.8 4 4.5zm0 0c2.5 0 4-1.8 4-4.5-2.5 0-4 1.8-4 4.5z"/><path d="M12 14c-2.5 0-4-1.8-4-4.5 2.5 0 4 1.8 4 4.5zm0 0c2.5 0 4-1.8 4-4.5-2.5 0-4 1.8-4 4.5z"/><path d="M12 19c-2.5 0-4-1.8-4-4.5 2.5 0 4 1.8 4 4.5zm0 0c2.5 0 4-1.8 4-4.5-2.5 0-4 1.8-4 4.5z"/>',
  shield: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  leaf: '<path d="M5 19c-1-8 4-14 15-14 0 10-5 15-12 15-1.2 0-2.2-.3-3-1z"/><path d="M5 19c3-4 6-7 10-9"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.bolt}</svg>`;
}
