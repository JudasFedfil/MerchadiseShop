import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore' // Import store xác thực

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()

  // 1. Tự động tạo 'chìa khóa' (key) riêng cho từng tài khoản
  const storageKey = computed(() => {
    return authStore.user ? `cart_${authStore.user.username}` : 'cart_guest'
  })

  // 2. Khởi tạo giỏ hàng theo 'chìa khóa' hiện tại
  const savedCart = localStorage.getItem(storageKey.value)
  const cartItems = ref(savedCart ? JSON.parse(savedCart) : [])

  // 3. THEO DÕI ĐĂNG NHẬP / ĐĂNG XUẤT: 
  // Nếu storageKey thay đổi (VD: từ guest sang admin), tải lại đúng giỏ hàng của người đó
  watch(storageKey, (newKey) => {
    const saved = localStorage.getItem(newKey)
    cartItems.value = saved ? JSON.parse(saved) : []
  })

  // 4. THEO DÕI THÊM / SỬA / XÓA SẢN PHẨM: 
  // Bất cứ khi nào giỏ hàng đổi, lưu thẳng vào đúng 'chìa khóa' của người đang đăng nhập
  watch(cartItems, (newVal) => {
    localStorage.setItem(storageKey.value, JSON.stringify(newVal))
  }, { deep: true })


  // --- GETTERS ---
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })


  // --- ACTIONS ---
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.value.find(item => item.id === product.id && item.name === product.name)
    if (existingItem) {
      if (existingItem.quantity + quantity > existingItem.stock) {
        existingItem.quantity = existingItem.stock
        alert(`Chỉ còn ${existingItem.stock} sản phẩm trong kho!`)
      } else {
        existingItem.quantity += quantity
      }
    } else {
      cartItems.value.push({ ...product, quantity })
    }
  }

  const removeFromCart = (index) => {
    cartItems.value.splice(index, 1)
  }

  const updateQuantity = (index, newQuantity) => {
    const item = cartItems.value[index]
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      item.quantity = newQuantity
    }
  }

  const clearCart = () => {
    cartItems.value = []
  }

  return { 
    cartItems, 
    totalItems, 
    cartTotalAmount, 
    addToCart, 
    removeFromCart, 
    updateQuantity,
    clearCart
  }
})