<script setup>
defineProps({
  show: Boolean,
  error: Boolean,
  modelValue: String,
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <form class="pin-modal" @submit.prevent="emit('submit')">
        <h2 class="pin-modal__title">Enter access code</h2>
        <input
          :value="modelValue"
          class="pin-modal__input"
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="••••"
          autofocus
          @input="emit('update:modelValue', $event.target.value)"
        />
        <p v-if="error" class="pin-modal__error">Incorrect code, try again</p>
        <button class="pin-modal__btn" type="submit">Unlock</button>
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

.pin-modal {
  font-family: 'Montserrat', system-ui, sans-serif;
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
  width: 100%;
  text-align: center;
}

.pin-modal__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
}
</style>
