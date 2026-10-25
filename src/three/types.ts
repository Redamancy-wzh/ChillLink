export type BoxSpec = [string, [number, number, number, number, number, number]]

export interface PartGroup {
  key: string
  kind: 'real' | 'ghost'
  /** key under model.parts.* in the locale files */
  locale: string
  offset: [number, number, number]
  start: number
  anchor?: [number, number, number]
  dir?: [number, number, number]
  /** [name, [minX, minY, minZ, maxX, maxY, maxZ]] in metres, world space */
  boxes?: BoxSpec[]
  /** rotor pivot positions [x, y, z] in metres, world space */
  rotors?: [number, number, number][]
}

export interface Box3 {
  min: [number, number, number]
  max: [number, number, number]
}
