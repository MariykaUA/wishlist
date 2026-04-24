<script setup>
const { items, loading, removeItem } = useWishlist()
const { showPinModal, pinInput, pinError, requireAccessAlways, submitPin, closePinModal } = useAccessGate()

const showForm = ref(false)
const editingItem = ref(null)
</script>

<template>
  <BgPresents />

  <div class="page">
    <header class="header">
      <h1 class="header__title">Everything I dream of having one day</h1>
      <p class="header__subtitle">{{ items.length }} items on the list</p>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? '✕ Close' : '+ Add item' }}
      </button>
    </header>

    <Transition name="slide">
      <WishlistForm v-if="showForm" @close="showForm = false" />
    </Transition>

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

    <div v-else-if="!items.length && !showForm" class="state">
      No wishes yet - add your first one!
    </div>

    <div v-else class="grid">
      <WishlistCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @edit="(item) => requireAccessAlways(() => editingItem = item)"
        @delete="(id) => requireAccessAlways(() => removeItem(id))"
      />
    </div>
  </div>

  <EditModal :item="editingItem" @close="editingItem = null" />

  <PinModal
    v-model="pinInput"
    :show="showPinModal"
    :error="pinError"
    @submit="submitPin"
    @close="closePinModal"
  />
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem 4rem;
  font-family: 'Montserrat', system-ui, sans-serif;
}

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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.state {
  text-align: center;
  padding: 4rem;
  color: #888;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
}

.card {
  background: #fdf4ff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

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
</style>
