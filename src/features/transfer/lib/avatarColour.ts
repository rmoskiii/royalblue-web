const colours = ['#6B3FA0', '#E07B00', '#C93C38', '#1C6FB8', '#5B2C83', '#0E7C66'];

/** Stable avatar colour for a list position. */
export function avatarColour(index: number) {
  return colours[index % colours.length];
}
