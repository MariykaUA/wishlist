<script setup>
const props = defineProps({ item: Object })
const emit = defineEmits(['close'])
const { updateItem } = useWishlist()

const editFileInput = ref(null)
const editImageFile = ref(null)
const editImagePreview = ref(null)

const editForm = reactive({
  name: '',
  price: '',
  currency: 'CHF',
  description: '',
  store: '',
  url: '',
})

watch(() => props.item, (item) => {
  if (!item) return
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
})

function onImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  editImageFile.value = file
  editImagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  editImageFile.value = null
  editImagePreview.value = null
}

function submit() {
  if (!props.item || !editForm.name || !editForm.price) return

  const changes = {
    name: editForm.name,
    price: editForm.price,
    currency: editForm.currency,
    description: editForm.description,
    store: editForm.store,
    url: editForm.url,
    image: editImagePreview.value && !editImageFile.value ? editImagePreview.value : '',
  }

  const id = props.item.id
  const file = editImageFile.value ?? undefined

  emit('close')
  updateItem(id, changes, file)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="item" class="modal-backdrop" @click.self="emit('close')">
      <form class="modal-form" @submit.prevent="submit">
        <div class="modal-form__header">
          <h2 class="form__title">Edit item</h2>
          <button type="button" class="modal-form__close" @click="emit('close')">✕</button>
        </div>

        <div class="form__upload" @click="editFileInput.click()">
          <img v-if="editImagePreview" :src="editImagePreview" class="form__preview" alt="preview" />
          <div v-else class="form__upload-placeholder">
            <span class="form__upload-icon">🖼️</span>
            <span class="form__upload-text">Click to upload a photo</span>
            <span class="form__upload-hint">JPG, PNG, WEBP</span>
          </div>
          <button v-if="editImagePreview" type="button" class="form__remove-img" @click.stop="removeImage">✕</button>
        </div>
        <input ref="editFileInput" type="file" accept="image/*" class="form__file-hidden" @change="onImageChange" />

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
          <button class="form__submit" type="submit">Save changes</button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
  font-family: 'Montserrat', system-ui, sans-serif;
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

.form__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0;
}

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

.form__upload-icon { font-size: 1.75rem; }

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
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
  cursor: pointer;
}

.form__file-hidden { display: none; }

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

.form__required { color: #ec4899; }

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

.form__select:focus { border-color: #a855f7; }

.form__input--price { flex: 1; }

.form__textarea {
  resize: vertical;
  min-height: 64px;
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

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

.form__submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
}
</style>
