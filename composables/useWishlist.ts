import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  store: string
  url: string
}

export function useWishlist() {
  const { $db } = useNuxtApp()
  const items = ref<WishlistItem[]>([])
  const loading = ref(true)

  // Real-time listener
  const col = collection($db as any, 'wishlist')
  const q = query(col, orderBy('createdAt', 'desc'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    items.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem))
    loading.value = false
  })

  onUnmounted(unsubscribe)

  async function addItem(item: Omit<WishlistItem, 'id'>) {
    await addDoc(col, { ...item, createdAt: serverTimestamp() })
  }

  async function removeItem(id: string) {
    await deleteDoc(doc($db as any, 'wishlist', id))
  }

  return { items, loading, addItem, removeItem }
}
