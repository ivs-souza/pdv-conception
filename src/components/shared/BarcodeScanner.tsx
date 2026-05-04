import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { X, Camera } from 'lucide-react'

// Base64 beep sound for quick loading and reliability
const beepSound = "data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(beepSound)

    // Configuration optimized for fast mobile scanning
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    }

    try {
      scannerRef.current = new Html5QrcodeScanner("reader", config, false)
      
      scannerRef.current.render(
        (decodedText) => {
           // Play beep if possible
           if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play ignored by browser', e))
           }
           
           // Clear scanner and send back result
           if (scannerRef.current) {
              scannerRef.current.clear()
           }
           onScan(decodedText)
        },
        (errorMessage) => {
           // We ignore scan errors because they trigger every frame a code isn't perfectly aligned
           // console.log(errorMessage)
        }
      )
    } catch (e: any) {
      setError("Câmera indisponível ou permissão negada.")
      console.error(e)
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e))
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4">
       <div className="w-full max-w-sm bg-white rounded-[24px] overflow-hidden shadow-2xl animate-scale-in relative">
          
          <div className="bg-slate-900 p-4 flex items-center justify-between">
             <div className="flex items-center gap-2 text-white">
                <Camera size={18} className="text-blue-400" />
                <h3 className="text-sm font-black tracking-widest uppercase">Scanner de Código</h3>
             </div>
             <button 
               onClick={onClose}
               className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
             >
                <X size={16} />
             </button>
          </div>

          <div className="p-4 bg-slate-100 flex flex-col items-center">
             {error ? (
                <div className="py-12 text-center text-red-500 text-xs font-bold uppercase tracking-widest">
                   {error}
                </div>
             ) : (
                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-inner relative">
                   <div id="reader" className="w-full"></div>
                   
                   {/* CSS Overlay for targeting guide */}
                   <style dangerouslySetInnerHTML={{__html: `
                     #reader { border: none !important; }
                     #reader img { display: none !important; }
                     #reader__dashboard_section_csr { display: flex; flex-direction: column; gap: 8px; padding: 16px !important; }
                     #reader__dashboard_section_swaplink { text-decoration: none; color: #3b82f6; font-weight: bold; font-size: 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; }
                     #reader button { background: #0f172a; color: white; border: none; padding: 12px 16px; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
                     #reader video { object-fit: cover; }
                   `}} />
                </div>
             )}
             
             {!error && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 text-center">
                   Aponte a câmera para o código de barras
                </p>
             )}
          </div>
       </div>
    </div>
  )
}
