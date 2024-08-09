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

export const slideInOut = () => {
  const duration = DIV.TRANSITION.duration * 1000
  const easing = 'ease'
  const fill = 'forwards'
  const translateY = '50px'

  document.documentElement.animate(
    [
      {
        opacity: 1,
        transform: 'translate(0, 0)',
      },
      {
        opacity: 0,
        transform: `translate(0, ${translateY})`,
      },
    ],
    {
      duration,
      easing,
      fill,
      pseudoElement: '::view-transition-old(root)',
    },
  )

  document.documentElement.animate(
    [
      {
        opacity: 0,
        transform: `translate(0, -${translateY})`,
      },
      {
        opacity: 1,
        transform: 'translate(0, 0)',
      },
    ],
    {
      duration,
      easing,
      fill,
      pseudoElement: '::view-transition-new(root)',
    },
  )
}
