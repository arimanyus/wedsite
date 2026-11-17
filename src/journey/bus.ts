// Geometry of the baraat bus on the painted highway (`src/art/baraat.svg`).

/** Where Indore and Nanded stand on the highway, as fractions of the frieze's width. */
export const INDORE = 0.1
export const NANDED = 0.885

/** The bus is drawn 900 x 420 and shown at 42% of the frieze's height. */
export const BUS_HEIGHT = 0.42
/** The bus's width as a fraction of the frieze's width (the friezes are 4:1). */
export const BUS_WIDTH = (BUS_HEIGHT * (900 / 420)) / 4

/** Where the bus is along the frieze, 0 to 1, at a given point of the trip (0 = Indore, 1 = Nanded). */
export function busPosition(trip: number): number {
  return INDORE + (NANDED - INDORE) * trip
}
