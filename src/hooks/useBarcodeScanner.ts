import { useEffect, useRef } from 'react'

/**
 * Sapphire v3.2 - useBarcodeScanner
 * Hook to capture USB Barcode Scanner input globally.
 * Logic: Fast buffer with 100ms timeout to distinguish scanner from keyboard.
 */
export function useBarcodeScanner(onScan: (code: string) => void) {
  const buffer = useRef<string>('')
  const lastKeyTime = useRef<number>(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Prevention: Ignore if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const currentTime = Date.now()
      
      // 2. Buffer Cleanup: If time between keys is too long, it's a manual type, not a scanner
      if (currentTime - lastKeyTime.current > 100) {
        buffer.current = ''
      }

      lastKeyTime.current = currentTime

      // 3. Capture Enter: Final trigger for most scanners
      if (e.key === 'Enter') {
        if (buffer.current.length > 2) {
          onScan(buffer.current)
          buffer.current = ''
        }
        return
      }

      // 4. Capture Character: Only add printable characters
      if (e.key.length === 1) {
        buffer.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onScan])
}
