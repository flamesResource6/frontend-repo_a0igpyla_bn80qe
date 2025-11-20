import React from 'react'
import Spline from '@splinetool/react-spline'

const SplineBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      {/* subtle gradient veil to keep contrast; allow interactions through */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
    </div>
  )
}

export default SplineBackground
