<script setup>
defineProps({ item: Object })
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="card">
    <div class="card__image-wrap">
      <img v-if="item.image" :src="item.image" :alt="item.name" class="card__image" />
      <div v-else class="card__image-placeholder">🎁</div>
      <button class="card__edit" title="Edit" @click="emit('edit', item)">Edit</button>
      <button class="card__delete" title="Remove" @click="emit('delete', item.id)">✕</button>
    </div>

    <div class="card__body">
      <div class="card__header">
        <h2 class="card__name">{{ item.name }}</h2>
        <span class="card__price">{{ item.currency || 'CHF' }} {{ item.price }}</span>
      </div>
      <p v-if="item.description" class="card__desc">{{ item.description }}</p>

      <div class="card__footer">
        <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="btn">
          Go to store
        </a>
        <span v-if="item.store" class="card__store">{{ item.store }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.card__price {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.03em;
}

.card__desc {
  font-size: 0.8rem;
  color: #999;
  line-height: 1.55;
  font-style: italic;
}

.card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.card__store {
  font-size: 0.7rem;
  font-weight: 600;
  color: #1a1a2ebe;
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
</style>
