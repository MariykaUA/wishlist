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

export function useWishlist() {
  const { $db, $storage } = useNuxtApp()
  const items = ref<WishlistItem[]>([])
  const loading = ref(true)

  onMounted(() => {
    const col = collection($db as any, 'wishlist')
    const q = query(col, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      items.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem))
      loading.value = false
    })

    onUnmounted(unsubscribe)
  })

  async function uploadImage(file: File): Promise<string> {
    const path = `wishlist/${Date.now()}_${file.name}`
    const ref = storageRef($storage as any, path)
    await uploadBytes(ref, file)
    return getDownloadURL(ref)
  }

  async function addItem(item: Omit<WishlistItem, 'id'>, imageFile?: File) {
    const col = collection($db as any, 'wishlist')
    let imageUrl = item.image

    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    await addDoc(col, { ...item, image: imageUrl, createdAt: serverTimestamp() })
  }

  async function removeItem(id: string) {
    await deleteDoc(doc($db as any, 'wishlist', id))
  }

  return { items, loading, addItem, removeItem }
}
