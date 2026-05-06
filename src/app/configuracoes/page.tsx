'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Store, MapPin, MessageSquare, Trash2, Save, ArrowLeft, AlertCircle, RefreshCw, Layers, Plus, ShieldCheck, ShieldAlert, User, Mail, Trash } from 'lucide-react'
import { SettingsService } from '@/services/settings.service'
import { SaleService } from '@/services/sale.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/utils/firebase'
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link'

/**
 * Sapphire v2.2 - Configurações Panel
 * Store metadata and system maintenance.
 */
export default function ConfiguracoesPage() {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [storeData, setStoreData] = useState<any>({
    name: '',
    address: '',
    adminPhone: '',
    whatsappTemplate: ''
  })
  
  // Team Management State
  const [team, setTeam] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      if (!userData?.unidade) return
      const settings = await SettingsService.getSettings(userData.unidade)
      setStoreData(settings.store)
      setLoading(false)
    }
    load()

    // Real-time Team Listener
    if (userData?.unidade && userData.role === 'admin') {
      const q = query(collection(db, "usuarios"), where("unidade", "==", userData.unidade))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeam(users)
      })
      return () => unsubscribe()
    }
  }, [userData?.unidade, userData?.role])

  const handleToggleStockPermission = async (userId: string, currentStatus: boolean) => {
    if (!db) return
    try {
      await updateDoc(doc(db, "usuarios", userId), {
        canManageStock: !currentStatus
      })
      showToast("Permissão atualizada!", "success")
    } catch (e) {
      showToast("Erro ao atualizar permissão.", "error")
    }
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!db) return
    const confirm = window.confirm(`Deseja realmente REVOGAR o acesso de ${name}? Ele não conseguirá mais entrar no sistema.`)
    if (!confirm) return

    try {
      await deleteDoc(doc(db, "usuarios", userId))
      showToast("Acesso revogado com sucesso!", "success")
    } catch (e) {
      showToast("Erro ao revogar acesso.", "error")
    }
  }

  const handleSave = async () => {
    if (!userData?.unidade) return
    setIsSaving(true)
    try {
      const currentSettings = await SettingsService.getSettings(userData.unidade)
      await SettingsService.saveSettings({
        ...currentSettings,
        store: storeData
      }, userData.unidade)
      showToast("Configurações salvas!", "success")
    } catch (e) {
      showToast("Erro ao salvar.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearDatabase = async () => {
    const confirm1 = window.confirm("CUIDADO: Você está prestes a apagar todas as vendas, produtos e clientes. Esta ação é irreversível. Deseja continuar?")
    
    if (confirm1) {
      const prompt = window.prompt("Para confirmar a exclusão total do banco de dados, digite a palavra EXCLUIR abaixo:")
      
      if (prompt === "EXCLUIR") {
        setIsCleaning(true)
        try {
          await SettingsService.clearDatabase(userData!.unidade)
          showToast("Banco de dados limpo com sucesso!", "success")
          setTimeout(() => window.location.reload(), 2000)
        } catch (e) {
          showToast("Erro ao limpar banco.", "error")
        } finally {
          setIsCleaning(false)
        }
      } else if (prompt !== null) {
        showToast("Confirmação inválida. Operação cancelada.", "error")
      }
    }
  }

  const handleSyncCrm = async () => {
     const confirm = window.confirm("Deseja rodar o sincronizador do CRM? Ele vai varrer todas as vendas passadas e recalcular os totais de cada cliente. Pode demorar alguns segundos.")
     if (!confirm) return

     setIsSyncing(true)
     try {
        if (!userData?.unidade) return
        const count = await SaleService.syncCrmMetrics(userData.unidade)
        showToast(`CRM Sincronizado! ${count} clientes atualizados.`, "success")
     } catch (e) {
        console.error(e)
        showToast("Erro ao sincronizar CRM.", "error")
     } finally {
        setIsSyncing(false)
     }
  }

  const handleRescue = async () => {
    const confirm = window.confirm("ATENÇÃO: Deseja iniciar o RESGATE DE EMERGÊNCIA? O sistema buscará todos os dados sem unidade e os vinculará a 'Amora Amora'.")
    if (!confirm) return

    setIsSyncing(true)
    try {
      const count = await SaleService.rescueLegacyData()
      showToast(`${count} documentos resgatados com sucesso!`, "success")
    } catch (e) {
      console.error(e)
      showToast("Erro durante o resgate.", "error")
    } finally {
      setIsSyncing(false)
    }
  }

  // --- Staff Management ---
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '', canManageStock: false })
  const [isStaffCreating, setIsStaffCreating] = useState(false)
  const { registerStaff } = useAuth()

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData?.unidade) return
    
    const confirm = window.confirm(`Deseja cadastrar ${staffData.name} como vendedor da unidade ${userData.unidade}?`)
    if (!confirm) return

    setIsStaffCreating(true)
    try {
      await registerStaff(staffData.email, staffData.password, staffData.name, userData.unidade, staffData.canManageStock)
      showToast("Vendedor cadastrado com sucesso!", "success")
      setStaffData({ name: '', email: '', password: '', canManageStock: false })
    } catch (err: any) {
      console.error(err)
      showToast("Erro ao criar usuário: " + (err.message || 'Erro desconhecido'), "error")
    } finally {
      setIsStaffCreating(false)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse uppercase tracking-widest text-xs">
      Carregando Identidade...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <header className="flex items-center justify-between">
         <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-500/20">
                  <Settings size={22} />
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações Base</h1>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-13">Identidade da Loja & Manutenção</p>
         </div>
         <Link href="/" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Voltar
         </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Store Identity */}
         <div className="md:col-span-2 space-y-8">
            <section className="premium-card space-y-6">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dados da Empresa</h2>
               
               <div className="space-y-6">
                  <div className="relative">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Unidade / Loja</label>
                     <div className="relative">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                          placeholder="Minha Empresa Saphire"
                          value={storeData.name}
                          onChange={e => setStoreData({...storeData, name: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="relative">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endereço Físico (Opcional)</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                          placeholder="Av. das Esmeraldas, 1000 - Centro"
                          value={storeData.address}
                          onChange={e => setStoreData({...storeData, address: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="relative">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp para Fechamento de Caixa</label>
                     <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                          placeholder="5511999999999"
                          value={storeData.adminPhone || ''}
                          onChange={e => setStoreData({...storeData, adminPhone: e.target.value})}
                        />
                     </div>
                     <span className="text-[9px] text-slate-400 font-bold mt-2 block uppercase tracking-tighter">Inclua o código do país (ex: 55). Este número receberá o Dossiê diário.</span>
                  </div>

                  <div className="relative">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Template WhatsApp</label>
                     <div className="relative">
                        <MessageSquare className="absolute left-4 top-5 text-slate-400" size={18} />
                        <textarea 
                          rows={4}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                          placeholder="Template da mensagem de venda..."
                          value={storeData.whatsappTemplate}
                          onChange={e => setStoreData({...storeData, whatsappTemplate: e.target.value})}
                        />
                     </div>
                     <span className="text-[9px] text-slate-400 font-bold mt-2 block uppercase tracking-tighter">Use [Nome do Cliente], [Nome da Loja] e [Resumo] para preenchimento dinâmico.</span>
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-sapphire px-10 py-4 flex items-center gap-3 uppercase tracking-tighter disabled:opacity-50"
                  >
                     {isSaving ? "Gravando..." : "Salvar Empresa"} <Save size={18} />
                  </button>
               </div>
            </section>

            {/* Staff Management Section */}
            <section className="premium-card p-8 md:p-10 space-y-8">
               <div className="space-y-1">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestão de Equipe (Vendedores)</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">O novo usuário será automaticamente vinculado à sua unidade: <span className="text-blue-600">{userData?.unidade}</span></p>
               </div>
               
               <form onSubmit={handleRegisterStaff} className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do Vendedor</label>
                        <input 
                           required
                           type="text" 
                           value={staffData.name}
                           onChange={e => setStaffData({...staffData, name: e.target.value})}
                           className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                           placeholder="Ex: João Silva"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-mail de Acesso</label>
                        <input 
                           required
                           type="email" 
                           value={staffData.email}
                           onChange={e => setStaffData({...staffData, email: e.target.value})}
                           className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                           placeholder="vendedor@empresa.com"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Senha Provisória</label>
                        <input 
                           required
                           type="password" 
                           value={staffData.password}
                           onChange={e => setStaffData({...staffData, password: e.target.value})}
                           className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 mt-4">
                     <div className="flex items-center gap-3">
                        <div className="relative inline-flex items-center cursor-pointer">
                           <input 
                              type="checkbox" 
                              id="canManageStock"
                              checked={staffData.canManageStock}
                              onChange={e => setStaffData({...staffData, canManageStock: e.target.checked})}
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                           />
                        </div>
                        <label htmlFor="canManageStock" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                           Permitir Gerenciar Estoque (Ver custos e margens)
                        </label>
                     </div>

                     <button 
                        type="submit"
                        disabled={isStaffCreating}
                        className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10"
                     >
                        {isStaffCreating ? "Criando..." : "Cadastrar Colaborador"} 
                        {isStaffCreating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={18} />}
                     </button>
                  </div>
               </form>

               {/* Active Team List */}
               <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equipe Ativa ({team.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {team.map(member => (
                        <div key={member.id} className="group bg-white border border-slate-100 p-4 md:p-6 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Left Side: Info */}
                              <div className="flex items-center gap-3 md:gap-4">
                                 <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all ${member.role === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                    <User size={member.role === 'admin' ? 20 : 18} />
                                 </div>
                                 <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                       <span className="text-sm font-black text-slate-900 tracking-tight truncate">{member.nome}</span>
                                       {member.id === userData?.uid && (
                                          <span className="shrink-0 px-1.5 py-0.5 bg-slate-900 text-white text-[7px] font-black uppercase rounded-md">Você</span>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                                       <Mail size={10} />
                                       <span className="text-[9px] font-bold uppercase tracking-tight truncate">{member.email}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Right Side: Badges & Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                 <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${member.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                       {member.role}
                                    </span>
                                    {member.role === 'vendedor' && (
                                       <button 
                                          onClick={() => handleToggleStockPermission(member.id, member.canManageStock)}
                                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                             member.canManageStock 
                                             ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' 
                                             : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-900 hover:text-white'
                                          }`}
                                       >
                                          {member.canManageStock ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                          <span className="hidden xs:inline">{member.canManageStock ? "Gerente" : "Estoque"}</span>
                                       </button>
                                    )}
                                 </div>

                                 {member.id !== userData?.uid && (
                                    <button 
                                       onClick={() => handleDeleteUser(member.id, member.nome)}
                                       className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all ml-auto"
                                       title="Revogar Acesso"
                                    >
                                       <Trash size={16} />
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
         </div>

         {/* Maintenance Panel */}
         <div className="md:col-span-1 space-y-6">
            <section className="bg-white border border-red-100 rounded-3xl p-8 space-y-6 shadow-sm">
               <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Zona de Perigo</h3>
               </div>
               
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  A limpeza do banco de dados removerá permanentemente todos os registros de vendas, produtos e clientes. Use apenas para reiniciar o sistema.
               </p>

               <button 
                 onClick={handleClearDatabase}
                 disabled={isCleaning || isSyncing}
                 className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
               >
                  {isCleaning ? "Limpando..." : "Limpar Todo o Banco"} <Trash2 size={16} />
               </button>

               <button 
                 onClick={handleSyncCrm}
                 disabled={isSyncing || isCleaning}
                 className="w-full py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 mt-4"
               >
                  {isSyncing ? "Sincronizando..." : "Sincronizar CRM (Retroativo)"} <RefreshCw size={16} />
               </button>

               <button 
                 onClick={async () => {
                    const confirm = window.confirm("Deseja reconciliar as categorias das vendas? Isso corrigirá o gráfico do Dashboard com base nas categorias atuais do estoque.")
                    if (!confirm) return
                    setIsSyncing(true)
                    try {
                       if (!userData?.unidade) return
                       const count = await SaleService.syncSaleCategories(userData.unidade)
                       showToast(`${count} vendas corrigidas!`, "success")
                    } catch (e) {
                       showToast("Erro ao sincronizar categorias.", "error")
                    } finally {
                       setIsSyncing(false)
                    }
                 }}
                 disabled={isSyncing || isCleaning}
                 className="w-full py-4 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 mt-4"
               >
                  {isSyncing ? "Processando..." : "Revisar Categorias de Vendas"} <Layers size={16} />
               </button>

               <button 
                 onClick={handleRescue}
                 disabled={isSyncing || isCleaning}
                 className="w-full py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/10"
               >
                  {isSyncing ? "Resgatando..." : "Resgate de Dados Legados"} <RefreshCw size={16} />
               </button>
            </section>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Versão do Sistema</span>
               <span className="text-sm font-black text-slate-900 tracking-tighter">Sapphire v2.2.4</span>
            </div>
         </div>
      </div>
    </div>
  )
}
