<script setup lang="ts">
const { items, loading, addItem, removeItem } = useWishlist()

const showForm = ref(false)
const saving = ref(false)

const form = reactive({
  name: '',
  price: '',
  image: '',
  store: '',
  url: '',
})

async function submitForm() {
  if (!form.name || !form.price) return
  saving.value = true
  await addItem({
    name: form.name,
    price: parseFloat(form.price),
    image: form.image,
    store: form.store,
    url: form.url,
  })
  Object.assign(form, { name: '', price: '', image: '', store: '', url: '' })
  showForm.value = false
  saving.value = false
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="header__title">✨ My Wishlist</h1>
      <p class="header__subtitle">{{ items.length }} items</p>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Add item' }}
      </button>
    </header>

    <!-- Add form -->
    <form v-if="showForm" class="form" @submit.prevent="submitForm">
      <div class="form__row">
        <input v-model="form.name" class="form__input" placeholder="Item name *" required />
        <input v-model="form.price" class="form__input" type="number" min="0" step="0.01" placeholder="Price *" required />
      </div>
      <div class="form__row">
        <input v-model="form.store" class="form__input" placeholder="Store name" />
        <input v-model="form.url" class="form__input" type="url" placeholder="Link to buy (https://...)" />
      </div>
      <input v-model="form.image" class="form__input" placeholder="Image URL (https://...)" />
      <button class="form__submit" type="submit" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save item' }}
      </button>
    </form>

    <!-- Loading -->
    <div v-if="loading" class="state">Loading…</div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="state">
      No items yet. Add your first wish!
    </div>

    <!-- Grid -->
    <div v-else class="grid">
      <div v-for="item in items" :key="item.id" class="card">
        <div class="card__image-wrap">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            class="card__image"
          />
          <div v-else class="card__image-placeholder">🎁</div>
          <button class="card__delete" title="Remove" @click="removeItem(item.id)">✕</button>
        </div>

        <div class="card__body">
          <h2 class="card__name">{{ item.name }}</h2>

          <div class="card__meta">
            <span class="card__price">${{ item.price.toFixed(2) }}</span>
            <span v-if="item.store" class="card__store">{{ item.store }}</span>
          </div>

          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="btn"
          >
            Buy now →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page ── */
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Header ── */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.header__subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 1.25rem;
}

.add-btn {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #4f46e5;
}

/* ── Form ── */
.form {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form__input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.form__input:focus {
  border-color: #6366f1;
}

.form__submit {
  align-self: flex-end;
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 0.65rem 1.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.form__submit:hover:not(:disabled) {
  background: #4f46e5;
}

.form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* ── Card ── */
.card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* ── Image ── */
.card__image-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f4f4f8;
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background: rgba(0, 0, 0, 0.45);
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

/* ── Body ── */
.card__body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.card__name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card__price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
}

.card__store {
  font-size: 0.8rem;
  color: #888;
  background: #f4f4f8;
  padding: 3px 10px;
  border-radius: 999px;
}

.btn {
  display: block;
  margin-top: auto;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  background: #6366f1;
  color: #fff;
  transition: background 0.2s ease;
}

.btn:hover {
  background: #4f46e5;
}
</style>
