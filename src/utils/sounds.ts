/**
 * Sapphire v3.2 - Sound Effects Utils
 */
export const PlaySound = {
  beep: () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.1)
    } catch (e) {
      console.warn("Audio Context failed to start (interaction needed):", e)
    }
  },
  
  error: () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime) // A3 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.3)
    } catch (e) {
       console.warn("Audio Context error sound failed:", e)
    }
  }
}
