<script setup>
// Lets the admin choose which section an item belongs to.
// Usage: <SectionPicker v-model="form.section" />
const model = defineModel({ type: String, default: 'gift' })
</script>

<template>
  <div class="section-picker">
    <span class="section-picker__label">Section</span>
    <div class="section-picker__options">
      <button
        v-for="section in SECTIONS"
        :key="section.id"
        type="button"
        class="section-picker__option"
        :class="{ 'section-picker__option--active': model === section.id }"
        @click="model = section.id"
      >
        {{ section.icon }} {{ section.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section-picker {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.section-picker__label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.section-picker__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.section-picker__option {
  font-family: 'Montserrat', system-ui, sans-serif;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fafbff;
  color: #555;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.section-picker__option:hover {
  border-color: #a855f7;
}

.section-picker__option--active {
  border-color: #a855f7;
  background: #f3e8ff;
  color: #7e22ce;
}

@media (max-width: 480px) {
  .section-picker__options {
    grid-template-columns: 1fr;
  }
}
</style>
