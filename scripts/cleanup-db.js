/**
 * 🔥 SAPPHIRE — SCRIPT DE LIMPEZA TOTAL DO BANCO DE DADOS
 * 
 * Deleta TODOS os documentos de:
 *   - vendas
 *   - contas_a_receber
 *   - fluxo_de_caixa
 *   - estoque_movimentacoes
 * 
 * USO:
 *   node scripts/cleanup-db.js
 */

const { initializeApp, getApps } = require('firebase/app')
const { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } = require('firebase/firestore')

// Firebase config (same as frontend - these are public NEXT_PUBLIC_ keys)
const firebaseConfig = {
  apiKey: "AIzaSyB6WMaWv5ZJBNhTbFqedMtuZIlY_yN17g8",
  authDomain: "pdv-saphire.firebaseapp.com",
  projectId: "pdv-saphire",
  storageBucket: "pdv-saphire.firebasestorage.app",
  messagingSenderId: "998988402005",
  appId: "1:998988402005:web:d7f7db6b60c3393e0cf3dc"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

// ── Collections to nuke ─────────────────────────────────────
const COLLECTIONS_TO_PURGE = [
  'vendas',
  'contas_a_receber',
  'fluxo_de_caixa',
  'estoque_movimentacoes',
]

async function purgeCollection(collName) {
  process.stdout.write(`  🗑️  Limpando "${collName}"... `)
  try {
    const snap = await getDocs(collection(db, collName))
    if (snap.empty) {
      console.log('(vazio, pulando)')
      return 0
    }

    // Delete in batches of 500 (Firestore batch limit)
    let count = 0
    let batch = writeBatch(db)
    let batchCount = 0

    for (const d of snap.docs) {
      batch.delete(d.ref)
      batchCount++
      count++
      if (batchCount === 500) {
        await batch.commit()
        batch = writeBatch(db)
        batchCount = 0
      }
    }

    if (batchCount > 0) await batch.commit()
    console.log(`✅ ${count} documentos deletados`)
    return count
  } catch (e) {
    console.log(`❌ ERRO: ${e.message}`)
    return 0
  }
}

async function main() {
  console.log('\n🔥 SAPPHIRE DATABASE CLEANUP')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📌 Projeto: ${firebaseConfig.projectId}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Small delay to let Firestore connect
  await new Promise(r => setTimeout(r, 2000))

  let total = 0
  for (const col of COLLECTIONS_TO_PURGE) {
    total += await purgeCollection(col)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ LIMPEZA CONCLUÍDA: ${total} documentos removidos`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  process.exit(0)
}

main().catch(e => {
  console.error('\n❌ ERRO FATAL:', e.message)
  process.exit(1)
})
