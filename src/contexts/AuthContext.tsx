'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, type User } from 'firebase/auth'
import { auth, db } from '@/utils/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter, usePathname } from 'next/navigation'

interface UserData {
  uid: string
  nome: string
  email: string
  role: string
  unidade: string
  canManageStock?: boolean
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
  signUp: (email: string, pass: string, name: string) => Promise<void>
  registerStaff: (email: string, pass: string, name: string, unidade: string, canManageStock: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  signUp: async () => {},
  registerStaff: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        const docRef = doc(db, "usuarios", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData
          console.log('💎 Unidade Ativa:', data.unidade)
          setUserData(data)
          
          // Protection Logic (with userData)
          if (pathname !== '/login') {
             const restrictedPaths = ['/', '/configuracoes']
             if (data.role === 'vendedor' && restrictedPaths.includes(pathname)) {
               console.warn('⛔ Acesso restrito para vendedores. Redirecionando...')
               router.push('/vendas')
             }
          }
        }
      } else {
        setUserData(null)
      }

      setLoading(false)

      // Protection Logic (no user)
      if (!user && pathname !== '/login') {
        router.push('/login')
      } else if (user && pathname === '/login') {
        router.push('/')
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    if (auth) {
      await signOut(auth)
      setUserData(null)
      localStorage.clear() // Clear cache
      router.push('/login')
    }
  }

  const signUp = async (email: string, pass: string, name: string) => {
    if (!auth || !db) return

    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass)
    
    // 1. Update Profile in Auth
    await updateProfile(newUser, { displayName: name })

    const newProfile = {
      uid: newUser.uid,
      nome: name,
      email: email,
      role: 'admin',
      unidade: 'Amora Amora',
      createdAt: serverTimestamp()
    }

    // 2. Persist in Firestore
    await setDoc(doc(db, "usuarios", newUser.uid), newProfile)

    setUser(newUser)
    setUserData(newProfile as any)
    router.push('/')
  }

  const registerStaff = async (email: string, pass: string, name: string, unidade: string, canManageStock: boolean) => {
    if (!db) return

    // Setup Secondary App to avoid logging out the current admin
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth, createUserWithEmailAndPassword, signOut } = await import('firebase/auth')

    const secondaryConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    }

    const secondaryApp = getApps().find(a => a.name === 'Secondary') || initializeApp(secondaryConfig, 'Secondary')
    const secondaryAuth = getAuth(secondaryApp)
    
    const { user: newUser } = await createUserWithEmailAndPassword(secondaryAuth, email, pass)
    
    await setDoc(doc(db, "usuarios", newUser.uid), {
      uid: newUser.uid,
      nome: name,
      email: email,
      role: 'vendedor',
      unidade: unidade,
      canManageStock,
      createdAt: serverTimestamp()
    })

    await signOut(secondaryAuth)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, signUp, registerStaff }}>
      {loading ? (
        <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center z-[300]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Autenticando...</span>
           </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
