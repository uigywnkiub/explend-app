export const DIV = {
  INITIAL: { scale: 1 },
  ANIMATE: (hovered: boolean, withScale: boolean, scale?: number) => {
    if (withScale) {
      return hovered ? { scale: scale || 1.1 } : { scale: 1 }
    }
    return {}
  },
  TRANSITION: { type: 'tween', duration: 0.2 },
}
