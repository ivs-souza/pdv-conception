import { useState, useEffect } from 'react'
import { CashService } from '@/services/cash.service'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Sapphire v3.2 - useCurrentRegister
 * Hook to monitor the current unit's cash register status in real-time.
 */
export function useCurrentRegister() {
  const { userData } = useAuth()
  const [currentRegister, setCurrentRegister] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userData?.unidade) {
      setIsLoading(false)
      return
    }

    console.log('🔄 Hook: Iniciando monitoramento de caixa...')
    setIsLoading(true)
    try {
      const unsubscribe = CashService.subscribeToCurrentRegister(
        userData.unidade, 
        (reg) => {
          console.log('📦 Dashboard: Caixa pronto', reg ? `(Aberto: ${reg.id})` : '(Fechado)')
          setCurrentRegister(reg)
          setIsLoading(false)
        },
        (error) => {
          console.error('❌ Firestore Error (Register):', error)
          // Falha silenciosa: assume caixa fechado para não travar a UI
          setCurrentRegister(null)
          setIsLoading(false)
        }
      )
      return () => unsubscribe()
    } catch (e) {
      console.error('❌ Erro no Hook de Caixa:', e)
      setIsLoading(false)
    }
  }, [userData?.unidade])

  return {
    currentRegister,
    isLoading,
    isOpen: !!currentRegister
  }
}
