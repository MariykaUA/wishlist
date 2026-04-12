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
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export interface WishlistItem {
  id: string
  name: string
  price: string
  currency: string
  description: string
  image: string
  store: string
  url: string
}

// Module-level — persists across SPA navigations, resets on hard refresh
const cachedItems = ref<WishlistItem[]>([])
const isListening = ref(false)

export function useWishlist() {
  const { $db, $storage } = useNuxtApp()

  const loading = computed(() => cachedItems.value.length === 0 && !isListening.value)

  onMounted(() => {
    if (isListening.value) return

    const col = collection($db as any, 'wishlist')
    const q = query(col, orderBy('createdAt', 'desc'))

    isListening.value = true

    onSnapshot(
      q,
      (snapshot) => {
        // Keep any temp (optimistic) items, replace the rest with real data
        const tempItems = cachedItems.value.filter((i) => i.id.startsWith('temp_'))
        const realItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem))
        cachedItems.value = [...tempItems, ...realItems]
      },
      () => {
        // On error reset so listener retries on next mount
        isListening.value = false
      },
    )
  })

  async function uploadImage(file: File): Promise<string> {
    const path = `wishlist/${Date.now()}_${file.name}`
    const ref = storageRef($storage as any, path)
    await uploadBytes(ref, file)
    return getDownloadURL(ref)
  }

  async function addItem(item: Omit<WishlistItem, 'id'>, imageFile?: File) {
    const col = collection($db as any, 'wishlist')

    const tempId = `temp_${Date.now()}`
    cachedItems.value.unshift({
      ...item,
      id: tempId,
      image: imageFile ? URL.createObjectURL(imageFile) : item.image,
    })

    let imageUrl = item.image
    if (imageFile) imageUrl = await uploadImage(imageFile)

    await addDoc(col, { ...item, image: imageUrl, createdAt: serverTimestamp() })
    cachedItems.value = cachedItems.value.filter((i) => i.id !== tempId)
  }

  async function removeItem(id: string) {
    // Optimistic remove
    cachedItems.value = cachedItems.value.filter((i) => i.id !== id)
    await deleteDoc(doc($db as any, 'wishlist', id))
  }

  return { items: cachedItems, loading, addItem, removeItem }
}
