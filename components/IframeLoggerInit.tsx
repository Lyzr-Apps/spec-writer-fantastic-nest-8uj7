'use client'

import { useEffect } from 'react'
import { initIframeLogger } from '@/lib/iframeLogger'

/**
 * Client component that initializes the iframe logger on mount.
 * This intercepts all console methods and forwards logs to parent window.
 */
export function IframeLoggerInit() {
  useEffect(() => {
    initIframeLogger()
  }, [])

  return null
}
