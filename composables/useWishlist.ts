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
const hasLoaded = ref(false)

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.65))
    }
    img.onerror = reject
    img.src = url
  })
}

export function useWishlist() {
  const { $db } = useNuxtApp()

  // Show skeleton until the first Firestore snapshot arrives (or fails)
  const loading = computed(() => !hasLoaded.value)

  onMounted(() => {
    if (isListening.value) return

    const col = collection($db as any, 'wishlist')
    const q = query(col, orderBy('createdAt', 'desc'))

    isListening.value = true

    // Safety timeout — stop skeleton after 8 s even if Firebase is unreachable
    const timeout = setTimeout(() => { hasLoaded.value = true }, 8000)

    onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(timeout)
        hasLoaded.value = true
        // Keep any temp (optimistic) items, replace the rest with real data
        const tempItems = cachedItems.value.filter((i) => i.id.startsWith('temp_'))
        const realItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem))
        cachedItems.value = [...tempItems, ...realItems]
      },
      () => {
        // On error show empty state and allow retry on next mount
        clearTimeout(timeout)
        hasLoaded.value = true
        isListening.value = false
      },
    )
  })

  async function addItem(item: Omit<WishlistItem, 'id'>, imageFile?: File) {
    const col = collection($db as any, 'wishlist')

    const tempId = `temp_${Date.now()}`
    cachedItems.value.unshift({
      ...item,
      id: tempId,
      image: imageFile ? URL.createObjectURL(imageFile) : item.image,
    })

    let imageBase64 = item.image
    if (imageFile) imageBase64 = await compressImage(imageFile)

    await addDoc(col, { ...item, image: imageBase64, createdAt: serverTimestamp() })
    cachedItems.value = cachedItems.value.filter((i) => i.id !== tempId)
  }

  async function removeItem(id: string) {
    // Optimistic remove
    cachedItems.value = cachedItems.value.filter((i) => i.id !== id)
    await deleteDoc(doc($db as any, 'wishlist', id))
  }

  return { items: cachedItems, loading, addItem, removeItem }
}
