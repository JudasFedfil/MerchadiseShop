<template>
  <div class="cart-page">
    <h1 class="page-title">Giỏ Hàng Của Bạn</h1>

    <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <h2>Giỏ hàng đang trống</h2>
      <p>Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
      <router-link to="/products" class="btn btn-primary mt-3">Tiếp tục mua sắm</router-link>
    </div>

    <div v-else class="cart-container">
      <div class="cart-items">
        <div class="cart-header">
          <span class="col-product">Sản phẩm</span>
          <span class="col-price">Đơn giá</span>
          <span class="col-qty">Số lượng</span>
          <span class="col-total">Thành tiền</span>
          <span class="col-action">Xóa</span>
        </div>

        <div 
          v-for="(item, index) in cartStore.cartItems" 
          :key="index" 
          class="cart-row"
        >
          <div class="col-product">
            <img :src="getImageUrl(item.image)" :alt="item.name" class="item-img" />
            <div class="item-info">
              <router-link :to="`/product/${item.id}`" class="item-name">{{ item.name }}</router-link>
            </div>
          </div>
          
          <div class="col-price">{{ formatPrice(item.price) }}</div>
          
          <div class="col-qty">
            <div class="quantity-control">
              <button 
                @click="cartStore.updateQuantity(index, item.quantity - 1)" 
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              
              <input type="number" :value="item.quantity" readonly />
              
              <button 
                @click="cartStore.updateQuantity(index, item.quantity + 1)"
                :disabled="item.quantity >= item.stock"
              >
                +
              </button>
            </div>
          </div>
          
          <div class="col-total font-bold text-red">{{ formatPrice(item.price * item.quantity) }}</div>
          
          <div class="col-action">
            <button @click="cartStore.removeFromCart(index)" class="btn-remove" title="Xóa sản phẩm">🗑️</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Tổng Đơn Hàng</h3>
        
        <div class="summary-row">
          <span>Tổng số lượng:</span>
          <strong>{{ cartStore.totalItems }} sản phẩm</strong>
        </div>
        
        <div class="summary-row total-row">
          <span>Tổng cộng:</span>
          <strong class="text-red final-price">{{ formatPrice(cartStore.cartTotalAmount) }}</strong>
        </div>
        
        <p class="shipping-note">Phí vận chuyển sẽ được tính ở bước thanh toán.</p>
        
        <router-link to="/checkout" class="btn btn-primary btn-checkout" 
        style="display: block; box-sizing: border-box;">TIẾN HÀNH THANH TOÁN</router-link>        
        
        <router-link to="/products" class="continue-shopping">← Tiếp tục mua sắm</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const getImageUrl = (imageName) => {
  try {
    return require(`@/assets/image/${imageName}`)
  } catch (err) {
    return 'https://via.placeholder.com/100?text=No+Image'
  }
}
</script>

<style scoped>
.cart-page {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2f3542;
}

/* Giỏ hàng trống */
.empty-cart {
  text-align: center;
  padding: 5rem 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-cart h2 { color: #2f3542; margin-bottom: 10px; }
.empty-cart p { color: #747d8c; margin-bottom: 20px; }
.mt-3 { margin-top: 1.5rem; display: inline-block; }

/* Layout 2 cột cho giỏ hàng */
.cart-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

@media (max-width: 900px) {
  .cart-container { flex-direction: column; }
}

/* Cột trái: Danh sách */
.cart-items {
  flex: 7;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.cart-header {
  display: flex;
  font-weight: bold;
  color: #747d8c;
  border-bottom: 2px solid #f1f2f6;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.cart-row {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f1f2f6;
}

.cart-row:last-child { border-bottom: none; }

/* Các cột trong bảng */
.col-product { flex: 4; display: flex; align-items: center; gap: 15px; }
.col-price { flex: 2; font-size: 1.1rem; }
.col-qty { flex: 2; display: flex; justify-content: flex-start; }
.col-total { flex: 2; font-size: 1.2rem; }
.col-action { flex: 1; text-align: center; }

.item-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.item-name {
  color: #2f3542;
  font-weight: bold;
  text-decoration: none;
  font-size: 1.1rem;
}
.item-name:hover { color: #ff4757; }

/* Bộ điều khiển số lượng */
.quantity-control {
  display: flex;
  border: 1px solid #ced6e0;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-control button {
  width: 30px;
  height: 35px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.quantity-control button:hover:not(:disabled) { background: #f1f2f6; }
.quantity-control button:disabled { cursor: not-allowed; opacity: 0.5; }

.quantity-control input {
  width: 40px;
  text-align: center;
  border: none;
  border-left: 1px solid #ced6e0;
  border-right: 1px solid #ced6e0;
  font-size: 1rem;
}

/* Nút xóa */
.btn-remove {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.btn-remove:hover { opacity: 1; }

/* Cột phải: Tổng kết */
.cart-summary {
  flex: 3;
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
}

.cart-summary h3 {
  font-size: 1.5rem;
  border-bottom: 2px solid #f1f2f6;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.total-row {
  border-top: 1px dashed #ced6e0;
  padding-top: 15px;
  margin-top: 15px;
  font-size: 1.3rem;
}

.final-price { font-size: 1.8rem; }
.shipping-note { font-size: 0.9rem; color: #747d8c; margin-bottom: 25px; text-align: center; }

/* Nút bấm chung */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary { background: #ff4757; color: white; font-weight: bold; }
.btn-primary:hover { background: #ff6b81; }

.btn-checkout {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.continue-shopping {
  display: block;
  text-align: center;
  color: #1e90ff;
  text-decoration: none;
  font-weight: bold;
}
.continue-shopping:hover { text-decoration: underline; }

.text-red { color: #ff4757; }
.font-bold { font-weight: bold; }
</style>