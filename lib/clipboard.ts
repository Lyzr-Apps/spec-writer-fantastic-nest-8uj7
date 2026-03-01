/**
 * Safe clipboard utility for iframe environments
 *
 * The native Clipboard API (navigator.clipboard) is blocked in iframes
 * due to permissions policy. This utility provides fallback methods.
 */

/**
 * Copy text to clipboard with iframe-safe fallback
 * @param text - Text to copy
 * @returns Promise<boolean> - true if copy succeeded
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first (works outside iframes)
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Clipboard API blocked (likely in iframe), try fallback
    }
  }

  // Fallback: Use deprecated execCommand (works in iframes)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.pointerEvents = 'none'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    return successful
  } catch {
    console.error('Failed to copy to clipboard')
    return false
  }
}

/**
 * React hook for clipboard copy with status
 */
export function useCopyToClipboard(): [
  (text: string) => Promise<void>,
  boolean
] {
  const [copied, setCopied] = React.useState(false)

  const copy = React.useCallback(async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return [copy, copied]
}

// Import React for the hook
import * as React from 'react'
