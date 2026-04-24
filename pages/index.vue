<script setup lang="ts">
const { items, loading, addItem, removeItem, updateItem } = useWishlist()
const { public: { accessCode } } = useRuntimeConfig()

// ── Access gate ──
const isUnlocked = ref(false)
const showPinModal = ref(false)
const pinInput = ref('')
const pinError = ref(false)
let pendingAction: (() => void) | null = null

onMounted(() => {
  isUnlocked.value = sessionStorage.getItem('wl_unlocked') === '1'
})

function requireAccess(action: () => void) {
  if (isUnlocked.value) { action(); return }
  pendingAction = action
  pinInput.value = ''
  pinError.value = false
  showPinModal.value = true
}

function submitPin() {
  if (pinInput.value === String(accessCode)) {
    isUnlocked.value = true
    sessionStorage.setItem('wl_unlocked', '1')
    showPinModal.value = false
    pendingAction?.()
    pendingAction = null
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

function requireAccessAlways(action: () => void) {
  pendingAction = action
  pinInput.value = ''
  pinError.value = false
  showPinModal.value = true
}

function closePinModal() {
  showPinModal.value = false
  pendingAction = null
}

const showForm = ref(false)
const saving = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = reactive({
  name: '',
  price: '',
  currency: 'CHF',
  description: '',
  store: '',
  url: '',
})

// ── Edit ──
const editingItem = ref<import('~/composables/useWishlist').WishlistItem | null>(null)
const editImageFile = ref<File | null>(null)
const editImagePreview = ref<string | null>(null)
const editSaving = ref(false)

const editForm = reactive({
  name: '',
  price: '',
  currency: 'CHF',
  description: '',
  store: '',
  url: '',
})

function openEdit(item: import('~/composables/useWishlist').WishlistItem) {
  editingItem.value = item
  Object.assign(editForm, {
    name: item.name,
    price: item.price,
    currency: item.currency || 'CHF',
    description: item.description,
    store: item.store,
    url: item.url,
  })
  editImageFile.value = null
  editImagePreview.value = item.image || null
}

function closeEdit() {
  editingItem.value = null
  editImageFile.value = null
  editImagePreview.value = null
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  editImageFile.value = file
  editImagePreview.value = URL.createObjectURL(file)
}

function removeEditImage() {
  editImageFile.value = null
  editImagePreview.value = null
}

async function submitEdit() {
  if (!editingItem.value || !editForm.name || !editForm.price) return
  editSaving.value = true

  const changes = {
    name: editForm.name,
    price: editForm.price,
    currency: editForm.currency,
    description: editForm.description,
    store: editForm.store,
    url: editForm.url,
    image: editImagePreview.value && !editImageFile.value ? editImagePreview.value : '',
  }

  const id = editingItem.value.id
  closeEdit()
  await updateItem(id, changes, editImageFile.value ?? undefined)
  editSaving.value = false
}

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
}

function resetForm() {
  Object.assign(form, { name: '', price: '', currency: 'CHF', description: '', store: '', url: '' })
  imageFile.value = null
  imagePreview.value = null
  showForm.value = false
}

async function submitForm() {
  if (!form.name || !form.price) return

  const payload = {
    name: form.name,
    price: form.price,
    currency: form.currency,
    description: form.description,
    image: '',
    store: form.store,
    url: form.url,
  }
  const file = imageFile.value ?? undefined

  // Close form instantly — item appears in grid right away
  resetForm()

  // Finish upload + Firestore write in background
  addItem(payload, file)
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <h1 class="header__title">Everything I dream of having one day</h1>
      <p class="header__subtitle">{{ items.length }} items on the list</p>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? '✕ Close' : '+ Add item' }}
      </button>
    </header>

    <!-- Form panel -->
    <Transition name="slide">
      <form v-if="showForm" class="form" @submit.prevent="submitForm">
        <h2 class="form__title">Add a new wish</h2>

        <!-- Image upload -->
        <div class="form__upload" @click="($refs.fileInput as HTMLInputElement).click()">
          <img v-if="imagePreview" :src="imagePreview" class="form__preview" alt="preview" />
          <div v-else class="form__upload-placeholder">
            <span class="form__upload-icon">🖼️</span>
            <span class="form__upload-text">Click to upload a photo</span>
            <span class="form__upload-hint">JPG, PNG, WEBP</span>
          </div>
          <button v-if="imagePreview" type="button" class="form__remove-img" @click.stop="removeImage">✕</button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="form__file-hidden" @change="onImageChange" />

        <!-- Fields -->
        <div class="form__row">
          <div class="form__group">
            <label class="form__label">Item name <span class="form__required">*</span></label>
            <input v-model="form.name" class="form__input" placeholder="e.g. Sony headphones" required />
          </div>
          <div class="form__group">
            <label class="form__label">Price <span class="form__required">*</span></label>
            <div class="form__price-wrap">
              <select v-model="form.currency" class="form__select">
                <option>CHF</option>
                <option>EUR</option>
              </select>
              <input
                v-model="form.price"
                class="form__input form__input--price"
                type="text"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label">Description</label>
          <textarea
            v-model="form.description"
            class="form__input form__textarea"
            placeholder="Why do you want this? Any notes…"
            rows="3"
          />
        </div>

        <div class="form__row">
          <div class="form__group">
            <label class="form__label">Store</label>
            <input v-model="form.store" class="form__input" placeholder="e.g. Amazon" />
          </div>
          <div class="form__group">
            <label class="form__label">Website URL</label>
            <input v-model="form.url" class="form__input" type="url" placeholder="https://..." />
          </div>
        </div>

        <div class="form__actions">
          <button class="form__submit" type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : 'Add to wishlist' }}
          </button>
        </div>
      </form>
    </Transition>

    <!-- Skeleton -->
    <div v-if="loading" class="grid">
      <div v-for="n in 6" :key="n" class="card skeleton">
        <div class="skeleton__image" />
        <div class="skeleton__body">
          <div class="skeleton__line skeleton__line--title" />
          <div class="skeleton__line skeleton__line--short" />
          <div class="skeleton__line skeleton__line--btn" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length && !showForm" class="state">
      No wishes yet - add your first one!
    </div>

    <!-- Grid -->
    <div v-else class="grid">
      <div v-for="item in items" :key="item.id" class="card">
        <div class="card__image-wrap">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="card__image" />
          <div v-else class="card__image-placeholder">🎁</div>
          <button class="card__edit" title="Edit" @click="requireAccessAlways(() => openEdit(item))">Edit</button>
          <button class="card__delete" title="Remove" @click="requireAccessAlways(() => removeItem(item.id))">✕</button>
        </div>

        <div class="card__body">
          <div class="card__header">
            <h2 class="card__name">{{ item.name }}</h2>
            <span class="card__price">{{ item.currency || 'CHF' }} {{ item.price }}</span>
          </div>
          <p v-if="item.description" class="card__desc">{{ item.description }}</p>

          <div class="card__footer">
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="btn">
              Buy now →
            </a>
            <span v-if="item.store" class="card__store">{{ item.store }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit modal -->
  <Transition name="fade">
    <div v-if="editingItem" class="modal-backdrop" @click.self="closeEdit">
      <form class="modal-form" @submit.prevent="submitEdit">
        <div class="modal-form__header">
          <h2 class="form__title">Edit item</h2>
          <button type="button" class="modal-form__close" @click="closeEdit">✕</button>
        </div>

        <!-- Image upload -->
        <div class="form__upload" @click="($refs.editFileInput as HTMLInputElement).click()">
          <img v-if="editImagePreview" :src="editImagePreview" class="form__preview" alt="preview" />
          <div v-else class="form__upload-placeholder">
            <span class="form__upload-icon">🖼️</span>
            <span class="form__upload-text">Click to upload a photo</span>
            <span class="form__upload-hint">JPG, PNG, WEBP</span>
          </div>
          <button v-if="editImagePreview" type="button" class="form__remove-img" @click.stop="removeEditImage">✕</button>
        </div>
        <input ref="editFileInput" type="file" accept="image/*" class="form__file-hidden" @change="onEditImageChange" />

        <div class="form__row">
          <div class="form__group">
            <label class="form__label">Item name <span class="form__required">*</span></label>
            <input v-model="editForm.name" class="form__input" required />
          </div>
          <div class="form__group">
            <label class="form__label">Price <span class="form__required">*</span></label>
            <div class="form__price-wrap">
              <select v-model="editForm.currency" class="form__select">
                <option>CHF</option>
                <option>EUR</option>
              </select>
              <input v-model="editForm.price" class="form__input form__input--price" type="text" required />
            </div>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label">Description</label>
          <textarea v-model="editForm.description" class="form__input form__textarea" rows="3" />
        </div>

        <div class="form__row">
          <div class="form__group">
            <label class="form__label">Store</label>
            <input v-model="editForm.store" class="form__input" />
          </div>
          <div class="form__group">
            <label class="form__label">Website URL</label>
            <input v-model="editForm.url" class="form__input" type="url" />
          </div>
        </div>

        <div class="form__actions">
          <button class="form__submit" type="submit" :disabled="editSaving">
            {{ editSaving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>
  </Transition>

  <!-- PIN modal -->
  <Transition name="fade">
    <div v-if="showPinModal" class="modal-backdrop" @click.self="closePinModal">
      <form class="pin-modal" @submit.prevent="submitPin">
        <h2 class="pin-modal__title">Enter access code</h2>
        <input
          v-model="pinInput"
          class="pin-modal__input"
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="••••"
          autofocus
          @input="pinError = false"
        />
        <p v-if="pinError" class="pin-modal__error">Incorrect code, try again</p>
        <button class="form__submit pin-modal__btn" type="submit">Unlock</button>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Page ── */
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem 4rem;
  font-family: 'Montserrat', system-ui, sans-serif;
}

/* ── Header ── */
.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header__title {
  font-family: 'Barrio', cursive;
  font-size: 3.5rem;
  font-weight: 400;
  color: #1a1a2e;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.header__subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.add-btn {
  font-family: 'Montserrat', system-ui, sans-serif;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #fff;
  border: none;
  padding: 0.65rem 1.75rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
}

/* ── Form ── */
.form {
  background: linear-gradient(135deg, #fdf4ff 0%, #eff6ff 50%, #f0fdf4 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 560px;
  margin-inline: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0;
}

/* ── Image upload ── */
.form__upload {
  position: relative;
  height: 130px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbff;
  transition: border-color 0.2s, background 0.2s;
}

.form__upload:hover {
  border-color: #a855f7;
  background: #fdf4ff;
}

.form__upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  pointer-events: none;
}

.form__upload-icon {
  font-size: 1.75rem;
}

.form__upload-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}

.form__upload-hint {
  font-size: 0.7rem;
  color: #aaa;
}

.form__preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form__remove-img {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
  cursor: pointer;
}

.form__file-hidden {
  display: none;
}

/* ── Fields ── */
.form__group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form__label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.form__required {
  color: #ec4899;
}

.form__input {
  font-family: 'Montserrat', system-ui, sans-serif;
  width: 100%;
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafbff;
}

.form__input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.form__price-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form__select {
  font-family: 'Montserrat', system-ui, sans-serif;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f08c35;
  background: #fafbff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  flex-shrink: 0;
}

.form__select:focus {
  border-color: #a855f7;
}

.form__input--price {
  flex: 1;
}

.form__textarea {
  resize: vertical;
  min-height: 64px;
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Form actions ── */
.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.25rem;
}


.form__submit {
  font-family: 'Montserrat', system-ui, sans-serif;
  background: linear-gradient(135deg, #22c55e, #10b981);
  color: #fff;
  border: none;
  padding: 0.65rem 1.75rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.form__submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
}

.form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Slide transition ── */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ── State ── */
.state {
  text-align: center;
  padding: 4rem;
  color: #888;
  font-size: 1.1rem;
}

/* ── Grid ── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
}

/* ── Skeleton ── */
.skeleton { pointer-events: none; }

.skeleton__image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton__body {
  padding: 1.1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.skeleton__line {
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton__line--title { height: 14px; width: 70%; }
.skeleton__line--short { height: 12px; width: 45%; }
.skeleton__line--btn   { height: 30px; width: 100px; border-radius: 999px; margin-top: 0.25rem; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Card ── */
.card {
  background: #fdf4ff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:nth-child(2n) { background: #eff6ff; }
.card:nth-child(3n) { background: #f0fdf4; }
.card:nth-child(4n) { background: #fff7ed; }
.card:nth-child(5n) { background: #fdf2f8; }
.card:nth-child(6n) { background: #f0fdfa; }

.card:hover {
  box-shadow: 0 8px 24px rgba(255, 170, 42, 0.16);
}

.card__image-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f4f4f8;
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.card:hover .card__image {
  transform: scale(1.04);
}

.card__image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.card__delete {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.card:hover .card__delete {
  opacity: 1;
}

.card__body {
  padding: 1.1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.card__name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.card__desc {
  font-size: 0.8rem;
  color: #999;
  line-height: 1.55;
  font-style: italic;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.4rem;
}

.card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.card__price {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.03em;
}

.card__store {
  font-size: 0.7rem;
  font-weight: 600;
  color:  #1a1a2ebe;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9741654;
  padding: 3px 9px;
  align-self: center;
  border-radius: 999px;
}

.btn {
  font-family: 'Montserrat', system-ui, sans-serif;
  display: block;
  max-width: 140px;
  margin-top: 0;
  align-self: center;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 151, 41, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 151, 41, 0.2);
}

/* ── Card edit button ── */
.card__edit {
  position: absolute;
  top: 10px;
  right: 46px;
  height: 28px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  color: #1a1a2e;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  border-radius: 999px;
  padding: 0 0.65rem;
  font-family: 'Montserrat', system-ui, sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.15s;
  white-space: nowrap;
}

.card__edit:hover {
  background: rgba(255, 255, 255, 1);
}

.card:hover .card__edit {
  opacity: 1;
}

/* ── Edit modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-form {
  background: linear-gradient(135deg, #fdf4ff 0%, #eff6ff 50%, #f0fdf4 100%);
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.modal-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-form__close {
  background: none;
  border: none;
  font-size: 1rem;
  color: #888;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.modal-form__close:hover {
  background: rgba(0, 0, 0, 0.07);
}

/* ── PIN modal ── */
.pin-modal {
  background: linear-gradient(135deg, #fdf4ff 0%, #eff6ff 100%);
  border-radius: 20px;
  padding: 2rem 1.75rem;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pin-modal__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  text-align: center;
}

.pin-modal__input {
  font-family: 'Montserrat', system-ui, sans-serif;
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.4rem;
  letter-spacing: 0.3em;
  text-align: center;
  color: #1a1a2e;
  background: #fafbff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.pin-modal__input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.pin-modal__error {
  font-size: 0.78rem;
  color: #ec4899;
  font-weight: 600;
  margin: 0;
}

.pin-modal__btn {
  width: 100%;
  text-align: center;
}

/* ── Fade transition ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
