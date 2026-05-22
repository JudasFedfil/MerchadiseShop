<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">Tra Cứu Đơn Hàng</h1>
      <p v-if="authStore.user">Quản lý lịch sử mua sắm của bạn tại MechShop</p>
      <p v-else>Nhập mã đơn hàng và số điện thoại để kiểm tra tiến độ</p>
    </div>

    <div v-if="!authStore.user" class="guest-tracking-form">
      <div class="form-box">
        <input type="number" v-model="searchId" placeholder="Mã đơn hàng (VD: 1)" class="track-input" />
        <input type="tel" v-model="searchPhone" placeholder="Số điện thoại đặt hàng" class="track-input" />
        <button @click="trackGuestOrder" class="btn btn-primary">Tra cứu ngay</button>
      </div>
      <p v-if="searchError" class="error-msg">{{ searchError }}</p>
    </div>

    <div class="orders-list">
      <div v-if="isLoading" class="text-center p-3">Đang tải dữ liệu...</div>
      
      <div v-else-if="myOrders.length === 0" class="empty-orders">
        <div class="icon">📦</div>
        <p>Bạn chưa có đơn hàng nào.</p>
        <router-link to="/products" class="btn btn-outline mt-2">Bắt đầu mua sắm</router-link>
      </div>

      <div v-for="order in myOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div>
            <h3>Đơn hàng #{{ order.id }}</h3>
            <span class="order-date">Ngày đặt: {{ order.createdAt }}</span>
          </div>
          <div class="order-status" :class="'status-' + order.status">
            {{ formatStatus(order.status) }}
          </div>
        </div>

        <div class="order-body">
          <div class="customer-info">
            <p><strong>Người nhận:</strong> {{ order.customerName }}</p>
            <p><strong>SĐT:</strong> {{ order.phone }}</p>
            <p><strong>Giao đến:</strong> {{ order.address }}</p>
          </div>
          
          <div class="items-list">
            <div v-for="(item, idx) in order.items" :key="idx" class="item-row">
              <span class="item-qty">{{ item.quantity }}x</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span>Tổng tiền:</span>
          <strong class="total-price">{{ formatPrice(order.total) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const myOrders = ref([])
const isLoading = ref(false)

// State cho form tìm kiếm của khách
const searchId = ref('')
const searchPhone = ref('')
const searchError = ref('')

// 👉 1. THÊM HÀM PARSE ITEMS "CHỐNG ĐẠN" VÀO ĐÂY
const parseItems = (itemsData) => {
  if (!itemsData) return []
  let parsed = itemsData

  // Bóc vỏ JSON cho đến khi nào ra được Array thì thôi
  while (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch (e) {
      console.error("Lỗi parse JSON chi tiết đơn hàng:", e)
      break
    }
  }

  return Array.isArray(parsed) ? parsed : []
}

// 2. LẤY ĐƠN HÀNG USER (ĐÃ SỬA LỖI GHI ĐÈ BIẾN)
const fetchUserOrders = async () => {
  if (!authStore.user) return;
  isLoading.value = true
  try {
    const response = await axios.get('http://localhost:8080/orders')
    
    // Lọc đơn hàng của user
    const filteredOrders = response.data.filter(
      order => String(order.userId) === String(authStore.user.id)
    )
    
    // Map qua từng đơn hàng, dùng parseItems để giải mã, sau đó sort ID giảm dần
    myOrders.value = filteredOrders.map(order => ({
      ...order,
      items: parseItems(order.items) // Dùng hàm mới ở đây
    })).sort((a, b) => b.id - a.id)
    
    // (Đã xóa dòng code gây lỗi ghi đè mảng cũ ở đây)

  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error)
  } finally {
    isLoading.value = false
  }
}

// 3. LẤY ĐƠN HÀNG KHÁCH (ĐÃ CẬP NHẬT PARSE ITEMS)
const trackGuestOrder = async () => {
  searchError.value = ''
  if (!searchId.value || !searchPhone.value) {
    searchError.value = 'Vui lòng nhập đầy đủ Mã đơn hàng và Số điện thoại!'
    return
  }
  
  isLoading.value = true
  try {
    const response = await axios.get('http://localhost:8080/orders')
    const foundOrder = response.data.filter(
      order => String(order.id) === String(searchId.value).trim() && 
               String(order.phone).trim() === String(searchPhone.value).trim()
    )

    if (foundOrder.length > 0) {
      myOrders.value = foundOrder.map(order => ({
        ...order,
        items: parseItems(order.items) // Dùng hàm mới ở đây
      }))
    } else {
      myOrders.value = []
      searchError.value = 'Không tìm thấy đơn hàng nào khớp thông tin trên!'
    }
  } catch (error) {
    console.error("Lỗi tra cứu:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    fetchUserOrders()
  }
})

// Tiện ích format
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
const formatStatus = (status) => {
  const map = { pending: '⏳ Chờ xác nhận', shipping: '🚚 Đang giao', completed: '✅ Hoàn thành', cancelled: '❌ Đã hủy' }
  return map[status] || status
}
</script>

<style scoped>
.orders-page { padding: 2rem 0; max-width: 800px; margin: 0 auto; min-height: 70vh; }
.page-header { text-align: center; margin-bottom: 2rem; }
.page-title { font-size: 2.5rem; color: #2f3542; margin-bottom: 5px; }

/* Form Tra cứu Khách */
.guest-tracking-form { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; text-align: center; }
.form-box { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
.track-input { padding: 12px 15px; border: 1px solid #ced6e0; border-radius: 8px; font-size: 1rem; outline: none; flex: 1; min-width: 200px; }
.track-input:focus { border-color: #ff4757; }
.error-msg { color: #ff4757; margin-top: 15px; font-weight: bold; }

/* Danh sách Đơn hàng */
.empty-orders { text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.empty-orders .icon { font-size: 4rem; margin-bottom: 10px; }
.empty-orders p { color: #747d8c; margin-bottom: 20px; font-size: 1.1rem; }

.order-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; border: 1px solid #f1f2f6; }
.order-header { display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #f1f2f6; }
.order-header h3 { margin: 0; color: #2f3542; font-size: 1.2rem; }
.order-date { font-size: 0.9rem; color: #747d8c; }
.order-status { padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; }

/* Status Colors */
.status-pending { background: #fff3cd; color: #856404; }
.status-shipping { background: #cce5ff; color: #004085; }
.status-completed { background: #d4edda; color: #155724; }
.status-cancelled { background: #f8d7da; color: #721c24; text-decoration: line-through;}

.order-body { padding: 20px; display: flex; gap: 20px; }
@media (max-width: 600px) { .order-body { flex-direction: column; } }

.customer-info { flex: 1; border-right: 1px dashed #ced6e0; padding-right: 20px; font-size: 0.95rem; color: #57606f; line-height: 1.6; }
@media (max-width: 600px) { .customer-info { border-right: none; border-bottom: 1px dashed #ced6e0; padding-right: 0; padding-bottom: 15px; } }
.customer-info strong { color: #2f3542; }

.items-list { flex: 2; display: flex; flex-direction: column; gap: 10px; }
.item-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f2f6; padding-bottom: 10px; }
.item-row:last-child { border-bottom: none; padding-bottom: 0; }
.item-qty { font-weight: bold; color: #ff4757; width: 30px; }
.item-name { flex: 1; color: #2f3542; padding: 0 10px; }
.item-price { color: #57606f; font-weight: 500; }

.order-footer { padding: 15px 20px; background: #fcfcfc; border-top: 1px solid #f1f2f6; text-align: right; font-size: 1.1rem; color: #2f3542; }
.total-price { color: #ff4757; font-size: 1.4rem; margin-left: 10px; }

.btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-primary { background: #ff4757; color: white; }
.btn-outline { background: transparent; border: 1px solid #ced6e0; color: #2f3542; text-decoration: none; display: inline-block;}
.mt-2 { margin-top: 10px; }
</style>