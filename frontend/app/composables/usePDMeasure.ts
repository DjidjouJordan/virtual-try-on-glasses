/**
 * Calcule l'écart pupillaire en mm depuis les landmarks MediaPipe.
 *
 * Méthode :
 *  1. Iris gauche center  = landmark 468
 *  2. Iris droit center   = landmark 473
 *  3. Iris gauche top     = landmark 469  → rayon de l'iris en px
 *  4. Diamètre iris réel  ≈ 11.7 mm  (valeur physiologique adulte)
 *  5. pixels/mm = iris_diam_px / 11.7
 *  6. PD = dist(468, 473) en px / pixels_per_mm
 */

interface Landmark {
  x: number
  y: number
  z: number
}

function dist2D(a: Landmark, b: Landmark, w: number, h: number): number {
  const dx = (a.x - b.x) * w
  const dy = (a.y - b.y) * h
  return Math.sqrt(dx * dx + dy * dy)
}

export function measurePDFromLandmarks(
  landmarks: Landmark[],
  videoWidth: number,
  videoHeight: number
): number | null {
  const leftIris  = landmarks[468]
  const rightIris = landmarks[473]
  const leftTop   = landmarks[469] // top of left iris ring
  const rightTop  = landmarks[474] // top of right iris ring

  if (!leftIris || !rightIris || !leftTop || !rightTop) return null

  // Iris radius in pixels (use both eyes, average)
  const leftRadius  = dist2D(leftIris, leftTop, videoWidth, videoHeight)
  const rightRadius = dist2D(rightIris, rightTop, videoWidth, videoHeight)
  const irisRadiusPx = (leftRadius + rightRadius) / 2
  if (irisRadiusPx < 1) return null

  const irisRealMm  = 11.7
  const pixelsPerMm = (irisRadiusPx * 2) / irisRealMm

  const ipdPx = dist2D(leftIris, rightIris, videoWidth, videoHeight)
  const pdMm  = ipdPx / pixelsPerMm

  // Sanity check: human PD is typically between 45mm and 80mm
  if (pdMm < 45 || pdMm > 80) return null
  return Math.round(pdMm * 10) / 10
}

/**
 * Calcule un score de compatibilité (0-100) entre un PD utilisateur et une plage cible.
 * Standard adulte : PD moyen ≈ 63 mm, plage normale 58-72 mm.
 */
export function calculerFit(userPD: number | null, targetPD = 63): number {
  if (userPD === null) return 0
  const diff = Math.abs(userPD - targetPD)
  if (diff <= 1) return 99
  if (diff <= 2) return 95
  if (diff <= 3) return 90
  if (diff <= 5) return 82
  if (diff <= 7) return 72
  if (diff <= 9) return 60
  return 50
}

export function fitLabel(score: number): string {
  if (score >= 95) return 'Parfait'
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Bon'
  if (score >= 55) return 'Passable'
  return 'Moyen'
}

export function fitColor(score: number): string {
  if (score >= 95) return 'text-green-400'
  if (score >= 85) return 'text-blue-400'
  if (score >= 70) return 'text-yellow-400'
  return 'text-orange-400'
}
