import type { PartGroup } from './types'

export type { PartGroup } from './types'

/**
 * Explode stages, in the order parts lift away.
 * `real` stages move a GRP_* node baked into the prepared GLB.
 * `ghost` stages draw a schematic volume at the V1 concept coordinates, because
 * the base cooler model does not contain the Effi-Chillcrate X1 lid modules.
 */
export const PART_GROUPS: PartGroup[] = [
  {
    key: 'handle',
    kind: 'real',
    locale: 'handle',
    offset: [0, 0.2, 0.03],
    start: 0.0,
    anchor: [0, 0.39, 0.0],
    dir: [-1, 0.35, 0],
  },
  {
    key: 'lid',
    kind: 'real',
    locale: 'lid',
    offset: [0, 0.1, 0],
    start: 0.06,
    anchor: [0.2, 0.33, 0.13],
    dir: [1, 0.3, 0.3],
  },
  {
    key: 'gasket',
    kind: 'real',
    locale: 'gasket',
    offset: [0, 0.07, -0.01],
    start: 0.12,
    anchor: [-0.22, 0.306, -0.12],
    dir: [-1, 0.2, -0.4],
  },
  {
    key: 'filllid',
    kind: 'ghost',
    locale: 'filllid',
    offset: [0, 0.3, -0.02],
    start: 0.2,
    boxes: [['filllid', [-0.135, 0.487, -0.137, 0.135, 0.507, 0.038]]],
  },
  {
    key: 'ui',
    kind: 'ghost',
    locale: 'ui',
    offset: [0, 0.26, 0.07],
    start: 0.27,
    boxes: [
      ['oled', [-0.011, 0.473, 0.09, 0.041, 0.478, 0.124]],
      ['buttons', [-0.053, 0.474, 0.098, 0.083, 0.481, 0.149]],
    ],
  },
  {
    key: 'electronics',
    kind: 'ghost',
    locale: 'electronics',
    offset: [0.1, 0.2, 0.06],
    start: 0.34,
    boxes: [
      ['electronics', [0.078, 0.424, 0.045, 0.223, 0.487, 0.14]],
      ['usbc', [0.129, 0.424, 0.102, 0.215, 0.452, 0.163]],
    ],
  },
  {
    key: 'co2',
    kind: 'ghost',
    locale: 'co2',
    offset: [0, 0.18, -0.16],
    start: 0.41,
    boxes: [['co2', [-0.051, 0.419, -0.178, 0.066, 0.483, -0.098]]],
  },
  {
    key: 'dryice',
    kind: 'ghost',
    locale: 'dryice',
    offset: [0, 0.14, 0],
    start: 0.48,
    boxes: [['dryice', [-0.138, 0.392, -0.14, 0.138, 0.488, 0.041]]],
  },
  {
    key: 'fans',
    kind: 'ghost',
    locale: 'fans',
    offset: [0, 0.1, 0.02],
    start: 0.55,
    boxes: [
      ['fan1', [-0.124, 0.443, -0.017, -0.052, 0.477, 0.054]],
      ['fan2', [0.052, 0.443, -0.017, 0.124, 0.477, 0.054]],
    ],
    rotors: [
      [-0.088, 0.46, 0.0185],
      [0.088, 0.46, 0.0185],
    ],
  },
  {
    key: 'fins',
    kind: 'ghost',
    locale: 'fins',
    offset: [0, 0.06, 0],
    start: 0.62,
    boxes: [['fins', [-0.147, 0.38, -0.07, 0.147, 0.446, 0.11]]],
  },
  {
    key: 'deck',
    kind: 'ghost',
    locale: 'deck',
    offset: [0, 0.02, 0],
    start: 0.69,
    boxes: [['deck', [-0.259, 0.317, -0.156, 0.259, 0.453, 0.156]]],
  },
  {
    key: 'insulation',
    kind: 'ghost',
    locale: 'insulation',
    offset: [0, -0.03, 0.01],
    start: 0.76,
    boxes: [['insul', [-0.237, 0.347, -0.136, 0.237, 0.409, 0.136]]],
  },
  {
    key: 'airpath',
    kind: 'ghost',
    locale: 'underside',
    offset: [0, -0.07, 0],
    start: 0.83,
    boxes: [['airpath', [-0.128, 0.31, -0.108, 0.128, 0.355, 0.113]]],
  },
]

/** Parts that never move; they anchor the exploded view. */
export const STATIC_PARTS: { key: string; locale: string }[] = [
  { key: 'body', locale: 'body' },
  { key: 'latchL', locale: 'latch' },
  { key: 'latchR', locale: 'latch' },
  { key: 'sideL', locale: 'side' },
  { key: 'sideR', locale: 'side' },
]
