/**
 * Cold-chain contents that can be loaded into the studio viewer.
 * Models come from `3D model/ColdChain_Contents/exports` (real-size, metres, origin at the base),
 * copied into public/model/contents with textures re-encoded for the web.
 *
 * Placements are hand-authored in the cooler's model space: the liner floor sits at y ≈ 0.046 m,
 * the usable interior is about x ±0.215 m, z ±0.112 m (+z = front, hinge at the back).
 * Items taller than ~0.14 m stay outside the centre strip (x ≈ −0.09 … 0.10) so they clear the
 * fan / heat-exchanger module that hangs under the lid when it closes.
 */
export type CargoId =
  | 'yuzu' | 'matcha' | 'juice' | 'gelato' | 'choco' | 'mochi'
  | 'vials' | 'tubes' | 'kit' | 'sushi' | 'sashimi' | 'wagyu'

export type CargoCategory = 'dining' | 'drinks' | 'dessert' | 'medical'

export interface CargoItem {
  id: CargoId
  file: string
  /** Outer size in millimetres, width × depth × height. */
  size: [number, number, number]
}

/** [x, z, rotationY, lift, rotationX] in model space (metres / radians). */
export type Placement = [number, number, number?, number?, number?]

export const FLOOR_Y = 0.046

export const CARGO_ITEMS: Record<CargoId, CargoItem> = {
  yuzu: { id: 'yuzu', file: '01_Yuzu_Sparkling.glb', size: [65.8, 64.5, 123.9] },
  matcha: { id: 'matcha', file: '02_Matcha_Milk.glb', size: [57, 57.5, 146.5] },
  juice: { id: 'juice', file: '03_Yuzu_Juice.glb', size: [57, 57.5, 155.9] },
  gelato: { id: 'gelato', file: '04_Gelato_Cup.glb', size: [88.6, 87, 145] },
  choco: { id: 'choco', file: '05_Chocolate_Bar.glb', size: [47, 22.5, 135] },
  mochi: { id: 'mochi', file: '06_Mochi_Gift.glb', size: [168, 70, 43.3] },
  vials: { id: 'vials', file: '07_Coldchain_Vials.glb', size: [94, 66.3, 66.5] },
  tubes: { id: 'tubes', file: '08_Sample_Tubes.glb', size: [93, 64.4, 98] },
  kit: { id: 'kit', file: '09_Biologic_Kit.glb', size: [142, 92, 50.3] },
  sushi: { id: 'sushi', file: '10_Omakase_Sushi.glb', size: [190, 126, 46.6] },
  sashimi: { id: 'sashimi', file: '11_Sashimi_Selection.glb', size: [192, 126, 41.1] },
  wagyu: { id: 'wagyu', file: '12_Wagyu_Tray.glb', size: [184, 120, 39.1] },
}

const ROWS = [-0.068, 0, 0.068]
const column = (x: number): Placement[] => ROWS.map(z => [x, z])
const QUARTER = Math.PI / 2

export const CARGO_LAYOUTS: Record<CargoCategory, Partial<Record<CargoId, Placement[]>>> = {
  dining: {
    sushi: [[-0.14, 0, QUARTER]],
    sashimi: [[0, 0, QUARTER]],
    wagyu: [[0.14, 0, QUARTER]],
  },
  drinks: {
    juice: [...column(-0.188), ...column(0.196)],
    matcha: [...column(-0.127), ...column(0.135)],
    yuzu: [...column(-0.05), ...column(0.022)],
  },
  dessert: {
    gelato: [[-0.165, -0.05], [-0.165, 0.05], [0.165, -0.05], [0.165, 0.05]],
    // Two gift boxes stacked at the back of the centre strip.
    mochi: [[0, -0.07], [0, -0.07, 0, 0.0434]],
    // Bars lie flat (rotated about X) in front of the gift boxes.
    choco: [-0.072, -0.024, 0.024, 0.072].map(x => [x, -0.03, 0, 0.0125, QUARTER] as Placement),
  },
  medical: {
    kit: [[-0.13, -0.05], [-0.13, 0.05]],
    vials: [[0.005, -0.04], [0.005, 0.038]],
    tubes: [[0.135, -0.04], [0.135, 0.038]],
  },
}

export const CARGO_CATEGORIES: CargoCategory[] = ['dining', 'drinks', 'dessert', 'medical']

/** Items a category shows, in display order. */
export const categoryItems = (category: CargoCategory) => Object.keys(CARGO_LAYOUTS[category]) as CargoId[]

/** Display set-point suggested for each load (inside the −25 … +10 °C target range). */
export const CARGO_SETPOINT: Record<CargoCategory, number> = { dining: -18, drinks: 4, dessert: -18, medical: 5 }

export interface CargoRequest {
  category: CargoCategory | null
  hidden: CargoId[]
}
