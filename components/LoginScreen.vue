<script setup>
const { loginAsAdmin, loginAsVisitor } = useAuth()
const { public: { accessCode } } = useRuntimeConfig()

const pin = ref('')
const pinError = ref(false)

function tryAdmin() {
  if (pin.value === String(accessCode)) {
    loginAsAdmin()
  } else {
    pinError.value = true
    pin.value = ''
  }
}
</script>

<template>
  <BgPresents />
  <div class="login-wrap">
    <div class="login-card">
      <h1 class="login-title">Everything I dream of having one day</h1>
      <p class="login-subtitle">Choose how you'd like to enter</p>

      <div class="options">
        <div class="option">
          <div class="option__icon">🔐</div>
          <h2 class="option__title">Admin</h2>
          <p class="option__desc">Full access to manage the list</p>
          <input
            v-model="pin"
            class="pin-input"
            :class="{ 'pin-input--error': pinError }"
            type="password"
            inputmode="numeric"
            placeholder="••••"
            autocomplete="off"
            @input="pinError = false"
            @keyup.enter="tryAdmin"
          />
          <p v-if="pinError" class="error-msg">Wrong code, try again</p>
          <button class="btn btn--admin" @click="tryAdmin">Enter</button>
        </div>

        <div class="divider"><span>or</span></div>

        <div class="option">
          <div class="option__icon">🎁</div>
          <h2 class="option__title">Visitor</h2>
          <p class="option__desc">Browse and reserve items</p>
          <button class="btn btn--visitor" @click="loginAsVisitor">Continue as Visitor</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Montserrat', system-ui, sans-serif;
}

.login-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.login-title {
  font-family: 'Barrio', cursive;
  font-size: 2.2rem;
  font-weight: 400;
  color: #1a1a2e;
  line-height: 1.15;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 2rem;
}

.options {
  display: flex;
  align-items: center;
  gap: 0;
}

.option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem;
}

.option__icon {
  font-size: 2rem;
  line-height: 1;
}

.option__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.option__desc {
  font-size: 0.78rem;
  color: #999;
  margin: 0;
  min-height: 2.4em;
}

.divider {
  display: flex;
  align-items: center;
  align-self: center;
  padding: 0 0.75rem;
  color: #ccc;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.pin-input {
  font-family: 'Montserrat', system-ui, sans-serif;
  width: 100%;
  max-width: 140px;
  padding: 0.6rem 0.75rem;
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

.pin-input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.pin-input--error {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.error-msg {
  font-size: 0.72rem;
  color: #ec4899;
  font-weight: 600;
  margin: 0;
}

.btn {
  font-family: 'Montserrat', system-ui, sans-serif;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  color: #fff;
  width: 100%;
  max-width: 160px;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn--admin {
  background: linear-gradient(135deg, #f97316, #ec4899);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
}

.btn--admin:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
}

.btn--visitor {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
}

.btn--visitor:hover {
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
}

@media (max-width: 480px) {
  .options {
    flex-direction: column;
  }

  .divider {
    padding: 0.25rem 0;
  }

  .login-title {
    font-size: 1.7rem;
  }
}
</style>
