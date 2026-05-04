'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Store, MapPin, MessageSquare, Trash2, Save, ArrowLeft, AlertCircle, RefreshCw, Layers } from 'lucide-react'
import { SettingsService } from '@/services/settings.service'
import { SaleService } from '@/services/sale.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
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
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      if (!userData?.unidade) return
      const settings = await SettingsService.getSettings(userData.unidade)
      setStoreData(settings.store)
      setLoading(false)
    }
    load()
  }, [userData?.unidade])

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
