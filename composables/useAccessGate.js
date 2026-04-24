export function useAccessGate() {
  const { public: { accessCode } } = useRuntimeConfig()
  const isUnlocked = ref(false)
  const showPinModal = ref(false)
  const pinInput = ref('')
  const pinError = ref(false)
  let pendingAction = null

  onMounted(() => {
    isUnlocked.value = sessionStorage.getItem('wl_unlocked') === '1'
  })

  function requireAccess(action) {
    if (isUnlocked.value) { action(); return }
    pendingAction = action
    pinInput.value = ''
    pinError.value = false
    showPinModal.value = true
  }

  function requireAccessAlways(action) {
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

  function closePinModal() {
    showPinModal.value = false
    pendingAction = null
  }

  return { showPinModal, pinInput, pinError, requireAccess, requireAccessAlways, submitPin, closePinModal }
}
