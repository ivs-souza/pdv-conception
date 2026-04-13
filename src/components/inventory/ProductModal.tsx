'use client'

import React, { useState } from 'react'
import { X, Camera, Plus, Check } from 'lucide-react'
import { ProductService } from '@/services/product.service'
import { useToast } from '@/components/layout/Toast'

interface ProductModalProps {
  onClose: () => void
}

/**
 * PDV Conception v2.0 - ProductModal
 * Professional form for cataloging items with SaaS precision.
 */
export function ProductModal({ onClose }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Alimentos',
    costPrice: '',
    salePrice: '',
    initialStock: '',
    minStock: '',
    customCategory: '',
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const categories = ["Alimentos", "Bebidas", "Vestuário", "Eletrônicos", "Acessórios", "Outros"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await ProductService.uploadImage(imageFile)
      }

      const finalData = {
        ...formData,
        category: formData.category === "Outros" ? formData.customCategory : formData.category,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        initialStock: Number(formData.initialStock),
        minStock: Number(formData.minStock),
        imageUrl
      }

      await ProductService.createProduct(finalData)
      showToast("Produto criado com sucesso!", "success")
      
      onClose()
    } catch (e) {
      showToast("Erro ao salvar produto.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-slate-100">
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Plus size={22} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 leading-none">Novo Produto</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">Catalogação de Ativos</span>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={24} />
           </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Core Info */}
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome do Produto</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="Ex: Camiseta AgroTech"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">SKU / Cód. Interno</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="LID-1234"
                         value={formData.sku}
                         onChange={e => setFormData({...formData, sku: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                       >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 {formData.category === "Outros" && (
                    <div className="animate-fade-in">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Categoria Customizada</label>
                       <input 
                         type="text" 
                         className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="Nova categoria"
                         value={formData.customCategory}
                         onChange={e => setFormData({...formData, customCategory: e.target.value})}
                       />
                    </div>
                 )}
              </div>

              {/* Right Column: Financials & Stock */}
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preço de Custo (R$)</label>
                       <input 
                         required
                         type="number" step="0.01"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="0,00"
                         value={formData.costPrice}
                         onChange={e => setFormData({...formData, costPrice: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preço de Venda (R$)</label>
                       <input 
                         required
                         type="number" step="0.01"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none font-bold text-blue-600"
                         placeholder="0,00"
                         value={formData.salePrice}
                         onChange={e => setFormData({...formData, salePrice: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estoque Inicial</label>
                       <input 
                         required
                         type="number"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="0"
                         value={formData.initialStock}
                         onChange={e => setFormData({...formData, initialStock: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-orange-400 border-orange-100 uppercase tracking-widest mb-2 block">Estoque Mínimo</label>
                       <input 
                         required
                         type="number"
                         className="w-full bg-orange-50/20 border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="Alerta"
                         value={formData.minStock}
                         onChange={e => setFormData({...formData, minStock: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* Photo Upload Area */}
                 <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto do Produto</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                       <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setImageFile(e.target.files[0])} />
                       {imageFile ? (
                         <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                            <Check size={16} /> Foto Selecionada
                         </div>
                       ) : (
                         <>
                            <Camera size={24} className="text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique para Upload</span>
                         </>
                       )}
                    </label>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-end gap-6 pt-4 border-t border-slate-50">
              <button type="button" onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Cancelar</button>
              <button 
                disabled={loading}
                type="submit" 
                className="btn-sapphire px-10 py-4 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
              >
                 {loading ? "Salvando..." : "Salvar Produto"}
              </button>
           </div>
        </form>
      </div>
    </div>
  )
}
