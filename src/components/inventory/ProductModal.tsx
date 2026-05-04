'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, Plus, Camera, Check, Edit } from 'lucide-react'
import { ProductService } from '@/services/product.service'
import { CategoryService } from '@/services/category.service'
import { useToast } from '@/components/layout/Toast'
import { BarcodeScanner } from '@/components/shared/BarcodeScanner'
import { useAuth } from '@/contexts/AuthContext'

interface ProductModalProps {
  onClose: () => void
  product?: any
}

/**
 * Sapphire v2.0 - ProductModal
 * Professional form for cataloging items with SaaS precision.
 */
export function ProductModal({ onClose, product }: ProductModalProps) {
  const { userData } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    costPrice: '',
    salePrice: '',
    currentStock: '', // Linked correctly for both Create/Update
    minStock: '5',
    description: '',
  })
  
  const [categories, setCategories] = useState<any[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    if (product) {
       setFormData({
         ...product,
         costPrice: String(product.costPrice || ''),
         salePrice: String(product.salePrice ?? product.precoVenda ?? product.preco_venda ?? ''),
         minStock: String(product.minStock || '5'),
         currentStock: String(product.currentStock || '0')
       })
    }
    if (userData?.unidade) {
      fetchCategories()
    }
  }, [product, userData?.unidade])

  const fetchCategories = async () => {
    if (!userData?.unidade) return
    const cats = await CategoryService.getCategories(userData.unidade)
    setCategories(cats)
    if (!product && cats.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: cats[0].name }))
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !userData?.unidade) return
    try {
      const added = await CategoryService.addCategory(newCategoryName.trim(), userData.unidade)
      setCategories(prev => [...prev, added])
      setFormData(prev => ({ ...prev, category: added.name }))
      setNewCategoryName('')
      setIsAddingCategory(false)
      showToast("Categoria adicionada!", "success")
    } catch (e) {
      showToast("Erro ao adicionar categoria", "error")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving || !userData?.unidade) return
    
    setIsSaving(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await ProductService.uploadImage(imageFile)
      }

      const finalData = {
        ...formData,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        currentStock: Number(formData.currentStock), // Precision check
        minStock: Number(formData.minStock),
        imageUrl: imageUrl || product?.imageUrl || ''
      }

      if (product?.id) {
        await ProductService.updateProduct(product.id, finalData)
        showToast("Produto atualizado com sucesso!", "success")
      } else {
        await ProductService.createProduct({
          ...finalData,
          initialStock: Number(formData.currentStock) // Map for legacy creation
        }, userData.unidade)
        showToast("Produto criado com sucesso!", "success")
      }
      
      // Delay closure for visual toast feedback
      setTimeout(() => onClose(), 800)
    } catch (err: any) {
      console.error("Erro Catálogo:", err)
      showToast(err.message || "Erro ao salvar produto.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-md animate-fade-in no-print cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 no-print pointer-events-none">
        <div 
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-slate-100 flex flex-col pointer-events-auto max-h-[95vh] md:max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 {product ? <Edit size={22} /> : <Plus size={22} />}
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 leading-none">
                   {product ? 'Editar Produto' : 'Novo Produto'}
                 </h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">
                   {product ? `Editando: ${product.name}` : 'Catalogação de Ativos'}
                 </span>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={24} />
           </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SKU / Cód. Interno</label>
                       <button 
                         type="button" 
                         onClick={() => setShowScanner(true)}
                         className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                       >
                          <Camera size={12} /> Scan
                       </button>
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                      placeholder="LID-1234"
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
                    <div className="flex gap-2">
                       {isAddingCategory ? (
                          <div className="flex-1 flex gap-2">
                             <input 
                               type="text" 
                               placeholder="Nova categoria..."
                               value={newCategoryName}
                               onChange={e => setNewCategoryName(e.target.value)}
                               className="flex-1 px-4 py-2 bg-slate-50 border border-blue-200 rounded-lg text-xs font-bold focus:outline-none"
                               autoFocus
                             />
                             <button 
                               type="button"
                               onClick={handleAddCategory}
                               className="p-2 bg-blue-600 text-white rounded-lg"
                             >
                                <Save size={14} />
                             </button>
                             <button 
                               type="button"
                               onClick={() => setIsAddingCategory(false)}
                               className="p-2 bg-slate-200 text-slate-400 rounded-lg"
                             >
                                <X size={14} />
                             </button>
                          </div>
                       ) : (
                         <>
                            <select 
                              value={formData.category}
                              onChange={e => setFormData({...formData, category: e.target.value})}
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                            <button 
                              type="button"
                              onClick={() => setIsAddingCategory(true)}
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            >
                               <Plus size={18} />
                            </button>
                         </>
                       )}
                    </div>
                 </div>

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
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estoque Atual</label>
                       <input 
                         required
                         type="number"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                         placeholder="0"
                         value={formData.currentStock}
                         onChange={e => setFormData({...formData, currentStock: e.target.value})}
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
                disabled={isSaving}
                type="submit" 
                className="btn-sapphire px-10 py-4 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
              >
                 {isSaving ? "Salvando..." : (product ? "Atualizar Produto" : "Salvar Produto")}
              </button>
           </div>
        </form>
      </div>
    </div>

      {showScanner && (
         <BarcodeScanner 
            onScan={(code) => {
               setFormData(prev => ({ ...prev, sku: code }))
               setShowScanner(false)
               showToast("Código lido com sucesso!", "success")
            }}
            onClose={() => setShowScanner(false)}
         />
      )}
    </>
  )
}
