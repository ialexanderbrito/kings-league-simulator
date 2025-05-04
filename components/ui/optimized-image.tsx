import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${isLoading ? 'animate-pulse bg-gray-700/20' : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-sm grayscale' : 'scale-100 blur-0 grayscale-0'}
          ${className}
        `}
        loading={loading as 'lazy' | 'eager'}
        onLoad={() => setIsLoading(false)}
        style={{
          objectFit: 'contain',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  )
}