<template>
  <div class="checkout-page">
    <h1 class="page-title">Thanh Toán Đơn Hàng</h1>

    <div v-if="cartStore.cartItems.length === 0" class="empty-cart-msg">
      Giỏ hàng của bạn đang trống! <router-link to="/products">Quay lại mua sắm</router-link>
    </div>

    <div v-else class="checkout-container">
      <div class="checkout-form">
        <h2>Thông Tin Giao Hàng</h2>
        <div v-if="!authStore.user" class="guest-notice">
          Bạn đang mua hàng với tư cách khách. <router-link to="/login">Đăng nhập</router-link> để lưu thông tin.
        </div>

        <form @submit.prevent="handleGenerateQR">
          <div class="form-group">
            <label>Họ và Tên người nhận *</label>
            <input type="text" v-model="shippingInfo.fullName" required placeholder="Nhập họ và tên đầy đủ" :disabled="showQR" />
          </div>

          <div class="form-group">
            <label>Số điện thoại *</label>
            <input type="tel" v-model="shippingInfo.phone" required placeholder="Nhập số điện thoại liên hệ" :disabled="showQR" />
          </div>

          <div class="form-group">
            <label>Địa chỉ nhận hàng *</label>
            <textarea v-model="shippingInfo.address" required rows="3" placeholder="Nhập địa chỉ chi tiết" :disabled="showQR"></textarea>
          </div>

          <button v-if="!showQR" type="submit" class="btn btn-primary btn-block">
            XÁC NHẬN & TẠO MÃ THANH TOÁN
          </button>
        </form>
      </div>

      <div class="checkout-summary">
        <h2>Đơn Hàng Của Bạn</h2>
        <div class="summary-items">
          <div v-for="(item, index) in cartStore.cartItems" :key="index" class="summary-item">
            <span class="item-name">{{ item.quantity }}x {{ item.name }}</span>
            <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="summary-total">
          <span>Cần thanh toán:</span>
          <strong class="text-red">{{ formatPrice(cartStore.cartTotalAmount) }}</strong>
        </div>

        <div v-if="showQR" class="qr-payment-section">
          <h3>Quét mã để thanh toán</h3>
          
          <p class="waiting-text">⏳ Đang chờ hệ thống ngân hàng xác nhận...</p>
          
          <div class="qr-image-wrapper">
            <img :src="vietQrUrl" alt="Mã QR Thanh Toán" class="qr-img" />
          </div>

          <button @click="cancelPayment" class="btn btn-outline btn-block mt-2">
            Hủy và Sửa lại thông tin giao hàng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const showQR = ref(false)
let paymentTimeout = null // Biến lưu trữ bộ đếm giờ

const shippingInfo = reactive({
  fullName: '',
  phone: '',
  address: ''
})

onMounted(() => {
  if (cartStore.cartItems.length === 0) {
    router.push('/cart')
  }

  if (authStore.user) {
    shippingInfo.fullName = authStore.user.fullName || ''
    shippingInfo.phone = authStore.user.phone || ''
    shippingInfo.address = authStore.user.address || ''
  }
})

const vietQrUrl = computed(() => {
  const bankId = 'MB'
  const accountNo = '0123456789'
  const accountName = 'MERCHSHOP'
  const amount = cartStore.cartTotalAmount
  const description = `Thanh toan don hang ${shippingInfo.phone}`
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

// XỬ LÝ KHI BẤM "TẠO MÃ QR"
const handleGenerateQR = () => {
  showQR.value = true
  
  paymentTimeout = setTimeout(() => {
    handleCompleteOrder()
  }, 5000)
}

// XỬ LÝ KHI BẤM "SỬA LẠI THÔNG TIN"
const cancelPayment = () => {
  showQR.value = false
  
  // Dừng ngay bộ đếm 2 giây lại để không bị chốt đơn nhầm
  if (paymentTimeout) {
    clearTimeout(paymentTimeout)
  }
}

// XỬ LÝ KHI THANH TOÁN THÀNH CÔNG
const handleCompleteOrder = async () => {
  try {
    const orderData = {
      // Không cần tự tạo ID nữa, MySQL Auto Increment sẽ tự cấp
      userId: authStore.user ? authStore.user.id : null,
      customerName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      
      // LƯU Ý: Backend đang định nghĩa items là String chứa JSON, nên ta phải ép kiểu
      items: JSON.stringify(cartStore.cartItems), 
      
      total: cartStore.cartTotalAmount,
      // Status và createdAt có thể bỏ qua vì ta set ở Backend rồi, nhưng để lại cho chắc cũng được
      createdAt: new Date().toLocaleDateString('vi-VN') 
    };

    // Gọi 1 lệnh POST duy nhất. Trừ kho, cộng lượt bán
    const res = await axios.post('http://localhost:8080/orders', orderData);

    // Lấy ID thật từ Database trả về để hiện thông báo
    alert(`✅ ĐẶT HÀNG THÀNH CÔNG!\n\nMã đơn hàng: #${res.data.id}`);
    
    cartStore.clearCart(); 
    router.push('/orders'); 

  } catch (error) {
    console.error("Lỗi khi lưu đơn hàng:", error);
    alert("Có lỗi xảy ra khi hệ thống ghi nhận đơn hàng. Vui lòng thử lại!");
  }
}
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS cũ của bạn, chỉ thêm class cho chữ nhấp nháy */
.checkout-page { padding: 2rem 0; max-width: 1000px; margin: 0 auto; }
.page-title { text-align: center; margin-bottom: 2rem; color: #2f3542; }
.empty-cart-msg { text-align: center; font-size: 1.2rem; padding: 3rem; }
.empty-cart-msg a { color: #ff4757; font-weight: bold; }

.checkout-container { display: flex; gap: 30px; }
@media (max-width: 768px) { .checkout-container { flex-direction: column; } }

.checkout-form { flex: 3; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.checkout-form h2 { margin-bottom: 20px; border-bottom: 2px solid #f1f2f6; padding-bottom: 10px; font-size: 1.5rem; }
.guest-notice { background: #fff3cd; padding: 10px; border-radius: 6px; margin-bottom: 20px; color: #856404; font-size: 0.95rem; }
.guest-notice a { font-weight: bold; color: #d39e00; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #2f3542; }
.form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ced6e0; border-radius: 6px; font-family: inherit; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { border-color: #ff4757; outline: none; }
.form-group input:disabled, .form-group textarea:disabled { background: #f1f2f6; color: #747d8c; cursor: not-allowed; }

.checkout-summary { flex: 2; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); height: fit-content; }
.checkout-summary h2 { margin-bottom: 20px; border-bottom: 2px solid #f1f2f6; padding-bottom: 10px; font-size: 1.5rem; }
.summary-items { margin-bottom: 20px; }
.summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 1rem; color: #57606f; }
.item-name { flex: 1; padding-right: 15px; }
.item-price { font-weight: bold; color: #2f3542; }

.summary-total { display: flex; justify-content: space-between; font-size: 1.2rem; border-top: 2px dashed #ced6e0; padding-top: 15px; margin-bottom: 20px; }
.text-red { color: #ff4757; font-size: 1.5rem; }

.qr-payment-section { text-align: center; border-top: 2px solid #f1f2f6; padding-top: 20px; animation: fadeIn 0.5s; }
.qr-image-wrapper { background: white; padding: 10px; border: 2px dashed #ced6e0; border-radius: 8px; display: inline-block; margin-bottom: 15px; }
.qr-img { max-width: 100%; width: 250px; height: auto; display: block; }

/* CSS Mới: Chữ nhấp nháy chờ thanh toán */
.waiting-text {
  color: #1e90ff;
  font-weight: bold;
  margin-bottom: 15px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.btn { padding: 12px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; transition: opacity 0.2s; }
.btn:hover { opacity: 0.8; }
.btn-block { width: 100%; display: block; }
.btn-primary { background: #ff4757; color: white; }
.btn-outline { background: transparent; border: 1px solid #ced6e0; color: #2f3542; }
.mt-2 { margin-top: 10px; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>