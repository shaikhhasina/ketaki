// Shader Gradient background for the enquiry section (feat/liquid-effects).
// Library: @shadergradient/react 2.4.20 (MIT) on @react-three/fiber 9.8.2, React 19.3.1, three 0.187.0 —
// all MIT, loaded from esm.sh through the import map in index.html. Loaded on demand by js/script.js.
import { createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

// Brand palette (css/style.css :root): maroon #7A1414, gold #C99A3B, orange #E8650A, dark green #14201A
const base = {
  control: 'props',
  type: 'waterPlane',
  animate: 'on',
  uSpeed: 0.12,
  uStrength: 1.4,
  uDensity: 1.1,
  uFrequency: 5.5,
  uAmplitude: 1,
  cAzimuthAngle: 180,
  cPolarAngle: 90,
  cDistance: 3.6,
  cameraZoom: 1,
  positionX: 0, positionY: 0, positionZ: 0,
  rotationX: 0, rotationY: 10, rotationZ: 50,
  lightType: '3d',   // no HDR environment download
  brightness: 1.1,
  reflection: 0.1,
  grain: 'off',      // no post-processing pass
  shader: 'defaults'
}

export const PRESETS = {
  calm:  { ...base, color1: '#7A1414', color2: '#C99A3B', color3: '#14201A' },
  vivid: { ...base, type: 'plane', uSpeed: 0.2, uStrength: 2.4, color1: '#E8650A', color2: '#C99A3B', color3: '#7A1414', brightness: 1.2 },
  mono:  { ...base, uSpeed: 0.1, color1: '#14201A', color2: '#2D4034', color3: '#C99A3B' }
}

export function mount(el, { preset = 'calm', pixelDensity = 1, onReady, onFail } = {}) {
  const root = createRoot(el)
  root.render(
    h(ShaderGradientCanvas, {
      style: { position: 'absolute', inset: 0 },
      pixelDensity,              // device pixel ratio cap
      pointerEvents: 'none',     // never steals clicks, scroll or touch
      lazyLoad: true,            // unmounts the WebGL canvas while the section is offscreen
      rootMargin: '100px'
    }, h(ShaderGradient, PRESETS[preset] || PRESETS.calm))
  )
  // safety net: if three.js reports a shader error, unmount so the CSS gradient stays and the console stays quiet
  let failed = false
  const onError = (e) => {
    const msg = String((e && (e.message || (e.error && e.error.message))) || '')
    if (failed || !/THREE\.|WebGL/i.test(msg)) return
    failed = true
    e.preventDefault && e.preventDefault()
    removeEventListener('error', onError)
    try { root.unmount() } catch (_) {}
    if (onFail) onFail(msg)
  }
  addEventListener('error', onError)
  // reveal once a few frames have rendered without errors
  const t0 = performance.now()
  ;(function wait () {
    if (failed) return
    if (el.querySelector('canvas') && performance.now() - t0 > 300) setTimeout(() => { if (!failed && onReady) onReady() }, 400)
    else if (performance.now() - t0 < 15000) requestAnimationFrame(wait)
  })()
  return () => { removeEventListener('error', onError); root.unmount() }
}
