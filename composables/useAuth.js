const role = ref(null)

if (process.client) {
  role.value = sessionStorage.getItem('wl_role') || null
}

export function useAuth() {
  const isAdmin = computed(() => role.value === 'admin')
  const isLoggedIn = computed(() => role.value !== null)

  function loginAsAdmin() {
    role.value = 'admin'
    sessionStorage.setItem('wl_role', 'admin')
  }

  function loginAsVisitor() {
    role.value = 'visitor'
    sessionStorage.setItem('wl_role', 'visitor')
  }

  function logout() {
    role.value = null
    sessionStorage.removeItem('wl_role')
  }

  return { role, isAdmin, isLoggedIn, loginAsAdmin, loginAsVisitor, logout }
}
