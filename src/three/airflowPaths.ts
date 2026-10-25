/** One recirculating air volume: centre return → fan → fins → side supply → floor.
 * Coordinates are a conceptual section in metres, not measured velocities/CFD.
 */
export type FlowFilter = 'all' | 'cold' | 'warm'
export type FanMode = 'single' | 'dual'
export interface AirflowOptions { playing: boolean; speed: number; filter: FlowFilter; reducedMotion: boolean; reset: number; fanMode: FanMode }
export const AIRFLOW_COLORS = { cold: '#64d5ff', warm: '#ffaa70' }
export const COLD_LEFT_2D = 'M290 185 C250 172 152 172 119 199 C80 231 81 330 122 356 C154 377 198 377 226 362'
export const WARM_LEFT_2D = 'M226 362 C258 345 270 311 270 274 L270 234 C270 210 278 193 290 185'
export const COLD_RIGHT_2D = 'M350 185 C390 172 488 172 521 199 C560 231 559 330 518 356 C486 377 442 377 414 362'
export const WARM_RIGHT_2D = 'M414 362 C382 345 370 311 370 274 L370 234 C370 210 362 193 350 185'
