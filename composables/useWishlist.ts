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

// Module-level cache — survives component unmount/remount
const cachedItems = ref<WishlistItem[]>([])
const initialised = ref(false)

export function useWishlist() {
  const { $db, $storage } = useNuxtApp()

  // Only show loading spinner on very first load
  const loading = computed(() => !initialised.value)

  onMounted(() => {
    if (initialised.value) return // already listening

    const col = collection($db as any, 'wishlist')
    const q = query(col, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      cachedItems.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem))
      initialised.value = true
    })

    // Keep listener alive for the session
    if (import.meta.client) {
      window.addEventListener('beforeunload', unsubscribe)
    }
  })

  async function uploadImage(file: File): Promise<string> {
    const path = `wishlist/${Date.now()}_${file.name}`
    const ref = storageRef($storage as any, path)
    await uploadBytes(ref, file)
    return getDownloadURL(ref)
  }

  async function addItem(item: Omit<WishlistItem, 'id'>, imageFile?: File) {
    const col = collection($db as any, 'wishlist')

    // Show item immediately with local preview
    const tempId = `temp_${Date.now()}`
    const tempItem: WishlistItem = {
      ...item,
      id: tempId,
      image: imageFile ? URL.createObjectURL(imageFile) : item.image,
    }
    cachedItems.value.unshift(tempItem)

    // Upload image + save to Firestore in background
    let imageUrl = item.image
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    await addDoc(col, { ...item, image: imageUrl, createdAt: serverTimestamp() })

    // Remove temp item — real one comes in via onSnapshot
    cachedItems.value = cachedItems.value.filter((i) => i.id !== tempId)
  }

  async function removeItem(id: string) {
    await deleteDoc(doc($db as any, 'wishlist', id))
  }

  return { items: cachedItems, loading, addItem, removeItem }
}
