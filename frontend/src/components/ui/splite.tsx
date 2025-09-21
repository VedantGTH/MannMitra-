import React, { Suspense, lazy, useState } from 'react'
import { Sparkles } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">3D Scene Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onError={() => setHasError(true)}
      />
    </Suspense>
  )
}