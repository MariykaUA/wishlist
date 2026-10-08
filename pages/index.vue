<script setup>
const { items, loading, removeItem, reserveItem, unreserveItem } = useWishlist()
const { isAdmin, isLoggedIn, logout } = useAuth()

const showForm = ref(false)
const editingItem = ref(null)

// Which section tab is open: 'gift' or 'self'
const activeSection = ref('gift')

const sectionItems = computed(() =>
  items.value.filter((item) => getSection(item) === activeSection.value)
)

function countItems(sectionId) {
  return items.value.filter((item) => getSection(item) === sectionId).length
}
</script>

<template>
  <LoginScreen v-if="!isLoggedIn" />

  <template v-else>
    <BgPresents />

    <div class="page">
      <header class="header">
        <button class="logout-btn" @click="logout">← Leave</button>
        <h1 class="header__title">Everything I dream of having one day</h1>

        <nav class="tabs" aria-label="Wishlist sections">
          <button
            v-for="section in SECTIONS"
            :key="section.id"
            class="tabs__btn"
            :class="{ 'tabs__btn--active': activeSection === section.id }"
            :aria-pressed="activeSection === section.id"
            @click="activeSection = section.id"
          >
            {{ section.icon }} {{ section.label }}
            <span class="tabs__count">{{ countItems(section.id) }}</span>
          </button>
        </nav>

        <p class="header__subtitle">{{ sectionItems.length }} items on the list</p>
        <button v-if="isAdmin" class="add-btn" @click="showForm = !showForm">
          {{ showForm ? '✕ Close' : '+ Add item' }}
        </button>
      </header>

      <Transition name="slide">
        <!-- :key resets the form's default section when the tab changes -->
        <WishlistForm
          v-if="showForm && isAdmin"
          :key="activeSection"
          :section="activeSection"
          @close="showForm = false"
        />
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

      <div v-else-if="!sectionItems.length && !showForm" class="state">
        No wishes here yet{{ isAdmin ? ' - add your first one!' : '.' }}
      </div>

      <div v-else class="grid">
        <WishlistCard
          v-for="item in sectionItems"
          :key="item.id"
          :item="item"
          :is-admin="isAdmin"
          @edit="(item) => editingItem = item"
          @delete="(id) => removeItem(id)"
          @reserve="(id, code) => reserveItem(id, code)"
          @unreserve="(id) => unreserveItem(id)"
        />
      </div>
    </div>

    <EditModal v-if="isAdmin" :item="editingItem" @close="editingItem = null" />
  </template>
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

.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tabs__btn {
  font-family: 'Montserrat', system-ui, sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  color: #555;
  border: 1.5px solid #e2e8f0;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.tabs__btn:hover {
  background: #fff;
  border-color: #cbd5e1;
}

.tabs__btn--active {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.3);
}

.tabs__btn--active:hover {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  border-color: transparent;
}

.tabs__count {
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 1.4rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.07);
}

.tabs__btn--active .tabs__count {
  background: rgba(255, 255, 255, 0.25);
}

.header__subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.logout-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-family: 'Montserrat', system-ui, sans-serif;
  background: rgba(255, 255, 255, 0.7);
  color: #888;
  border: 1.5px solid #e2e8f0;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.logout-btn:hover {
  color: #1a1a2e;
  background: #fff;
  border-color: #cbd5e1;
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
