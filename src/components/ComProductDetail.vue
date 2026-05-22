<template>
  <div class="product-detail-page">
    <div v-if="isLoading" class="status-message">Đang tải thông tin sản phẩm...</div>
    <div v-else-if="error" class="status-message error-message">{{ error }}</div>

    <div v-else-if="product" class="detail-container">
      <div class="product-main">
        <div class="product-image-gallery">
          <img :src="getImageUrl(product.image)" :alt="product.name" class="main-image" />
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          
          <div class="product-meta">
            <span class="stock" :class="{ 'out-of-stock': currentStock === 0 }">
              {{ currentStock > 0 ? `Còn hàng (${currentStock})` : 'Hết hàng' }}
            </span>
          </div>

          <div class="product-price-container">
            <template v-if="product.activeDiscount > 0">
              <div class="price-block">
                <span class="original-price">{{ formatPrice(originalCalculatedPrice) }}</span>
                
                <div class="current-price-row">
                  <span class="product-price text-red">{{ formatPrice(calculatedPrice) }}</span>
                  <span class="discount-badge">-{{ Math.round(product.activeDiscount) }}%</span>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="price-block">
                <span class="product-price text-red">{{ formatPrice(calculatedPrice) }}</span>
              </div>
            </template>
          </div>

          <div class="product-description">
            <h3>Mô tả sản phẩm:</h3>
            <p>{{ product.description }}</p>
          </div>

          <div v-if="product.variants && product.variants.length > 0" class="product-variants">
            <h3>Chọn phiên bản:</h3>
            <div class="variant-options">
              <button 
                v-for="variant in product.variants" 
                :key="variant.name"
                class="variant-btn"
                :class="{ active: selectedVariant?.name === variant.name }"
                @click="selectedVariant = variant"
              >
                {{ variant.name }} 
                <span v-if="variant.extraPrice > 0">(+{{ formatPrice(variant.extraPrice) }})</span>
              </button>
            </div>
          </div>

          <div class="purchase-section">
            <div class="quantity-selector">
              <button @click="decreaseQty" :disabled="quantity <= 1">-</button>
              <input type="number" v-model.number="quantity" min="1" :max="currentStock" readonly />
              <button @click="increaseQty" :disabled="quantity >= currentStock || currentStock === 0">+</button>
            </div>
            
            <div class="total-calc">
              Tạm tính: <strong>{{ formatPrice(calculatedPrice * quantity) }}</strong>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              class="btn btn-primary btn-large" 
              @click="handleAddToCart"
              :disabled="currentStock === 0"
            >
              🛒 THÊM VÀO GIỎ HÀNG
            </button>
            <button 
              class="btn btn-buy-now btn-large"
              @click="handleBuyNow" 
              :disabled="currentStock === 0"
            >
              ⚡ MUA NGAY
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const isLoading = ref(true)
const error = ref(null)

const quantity = ref(1)
const selectedVariant = ref(null)

const fetchProductDetail = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`http://localhost:8080/products/${route.params.id}`)
    product.value = response.data
    
    if (product.value.variants && product.value.variants.length > 0) {
      selectedVariant.value = product.value.variants[0]
    }
  } catch (err) {
    console.error("Lỗi:", err)
    error.value = "Không tìm thấy sản phẩm hoặc lỗi máy chủ!"
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
})

// HÀM TÍNH GIÁ ĐÃ GIẢM
const calculateDiscountPrice = (price, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return price;
  return price - (price * (discountPercent / 100));
}

// Tính Tồn kho hiện tại
const currentStock = computed(() => {
  if (!product.value) return 0;
  if (selectedVariant.value) {
    return selectedVariant.value.stock !== undefined ? selectedVariant.value.stock : product.value.stock;
  }
  return product.value.stock;
})

// Theo dõi nếu đổi Variant mà số lượng lớn hơn stock thì ép xuống
watch(selectedVariant, (newVariant) => {
  if (newVariant && newVariant.stock !== undefined && quantity.value > newVariant.stock) {
    quantity.value = newVariant.stock > 0 ? newVariant.stock : 1;
  }
})

// TÍNH GIÁ GỐC 
const originalCalculatedPrice = computed(() => {
  if (!product.value) return 0;
  const basePrice = product.value.price;
  const extraPrice = selectedVariant.value ? (selectedVariant.value.extraPrice || 0) : 0;
  return basePrice + extraPrice;
})

// TÍNH GIÁ CUỐI CÙNGSSS
const calculatedPrice = computed(() => {
  if (!product.value) return 0;
  const discountedBasePrice = calculateDiscountPrice(product.value.price, product.value.discount);
  const extraPrice = selectedVariant.value ? (selectedVariant.value.extraPrice || 0) : 0;
  return discountedBasePrice + extraPrice;
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

const getImageUrl = (imageName) => {
  try {
    return require(`@/assets/image/${imageName}`)
  } catch (err) {
    return '@/assets/ImageLoading.png'
  }
}

const increaseQty = () => {
  if (quantity.value < currentStock.value) quantity.value++
}

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}

const handleAddToCart = () => {
  const productToAdd = {
    ...product.value,
    id: selectedVariant.value ? `${product.value.id}-${selectedVariant.value.name}` : product.value.id,
    price: calculatedPrice.value, // Đã lấy giá chuẩn đã giảm
    name: selectedVariant.value ? `${product.value.name} (${selectedVariant.value.name})` : product.value.name,
    stock: currentStock.value 
  }
  
  cartStore.addToCart(productToAdd, quantity.value)
  alert(`Đã thêm ${quantity.value} sản phẩm vào giỏ hàng!`)
}

const handleBuyNow = () => {
  const productToAdd = {
    ...product.value,
    id: selectedVariant.value ? `${product.value.id}-${selectedVariant.value.name}` : product.value.id,
    price: calculatedPrice.value, 
    name: selectedVariant.value ? `${product.value.name} (${selectedVariant.value.name})` : product.value.name,
    stock: currentStock.value 
  }
  
  cartStore.addToCart(productToAdd, quantity.value)
  router.push('/checkout')
}
</script>

<style scoped>
.product-detail-page {
  padding: 2rem 0;
  max-width: 1000px;
  margin: 0 auto;
}

.status-message {
  text-align: center;
  font-size: 1.5rem;
  padding: 3rem;
}

.error-message {
  color: #ff4757;
}

/* Layout 2 cột */
.product-main {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

@media (max-width: 768px) {
  .product-main { flex-direction: column; }
}

.product-image-gallery {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-name {
  font-size: 2rem;
  color: #2f3542;
  margin-bottom: 5px;
  line-height: 1.3;
}

.product-meta {
  display: flex;
  gap: 20px;
  font-size: 1rem;
}

.stock { color: #2ed573; font-weight: bold; }
.out-of-stock { color: #ff4757; }

/* ========================================= */
/* CSS HIỂN THỊ GIÁ TRANG CHI TIẾT SẢN PHẨM  */
/* ========================================= */
.product-price-container {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 5px;
}

.price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Căn thẳng hàng bên trái với Tên sản phẩm */
}

.original-price {
  text-decoration: line-through;
  color: #a4b0be;
  font-size: 1.15rem;
  line-height: 1;
  margin-bottom: 8px;
  margin-left: 2px;
}

.current-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-price {
  font-size: 2.3rem; /* Size siêu to khổng lồ cho giá trang chi tiết */
  color: #ff4757;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.discount-badge {
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
}
/* ========================================= */

.product-description p {
  line-height: 1.6;
  color: #57606f;
}

/* Biến thể (Variants) */
.variant-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.variant-btn {
  padding: 8px 15px;
  border: 2px solid #ced6e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.variant-btn.active {
  border-color: #ff4757;
  color: #ff4757;
  font-weight: bold;
  background-color: #ffeef0;
}

/* Chọn số lượng */
.purchase-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  background: #f1f2f6;
  padding: 15px;
  border-radius: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  border: 1px solid #ced6e0;
  background: white;
  cursor: pointer;
}

.quantity-selector input {
  width: 60px;
  height: 40px;
  text-align: center;
  font-size: 1.1rem;
  border: 1px solid #ced6e0;
  border-left: none;
  border-right: none;
  outline: none;
}

.total-calc {
  font-size: 1.2rem;
  color: #2f3542;
}

.total-calc strong {
  color: #ff4757;
  font-size: 1.4rem;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
}

.btn-large {
  flex: 1;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary { background: #ff4757; color: white; }
.btn-primary:hover { background: #ff6b81; }
.btn-buy-now { background: #1e90ff; color: white; }
.btn-buy-now:hover { background: #70a1ff; }
.btn-large:disabled { background: #ced6e0; cursor: not-allowed; }
</style>