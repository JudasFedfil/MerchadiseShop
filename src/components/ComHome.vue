<template>
  <div class="home-page">
    <section class="hero-banner">
      <div class="banner-content">
        <h1>Khám Phá Thế Giới Figure & Gunpla</h1>
        <p>Hàng chính hãng - Đa dạng mẫu mã - Cập nhật liên tục</p>
        <router-link to="/products" class="btn btn-shop-now">Mua sắm ngay</router-link>
      </div>
    </section>

    <section class="hot-products-section">
      <h2 class="section-title">🔥 Sản Phẩm Nổi Bật</h2>

      <div v-if="isLoading" class="status-message">
        <p>Đang tải dữ liệu sản phẩm...</p>
      </div>

      <div v-else-if="error" class="status-message error-message">
        <p>{{ error }}</p>
      </div>

      <div v-else class="product-grid">
        <div 
          v-for="product in hotProducts" 
          :key="product.id" 
          class="product-card"
        >
          <span class="badge-hot">HOT</span>
          
          <img :src="getImageUrl(product.image)" :alt="product.name" class="product-img" />
          
          <div class="product-info">
            <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
            
            <div class="price-section">
              <template v-if="product.activeDiscount > 0">
                <div class="price-block">
                  <span class="original-price">{{ formatPrice(product.price) }}</span>
                  
                  <div class="current-price-row">
                    <span class="product-price text-red">{{ formatPrice(product.discountedPrice || product.price) }}</span>
                    <span class="discount-badge">-{{ Math.round(product.activeDiscount) }}%</span>
                  </div>
                </div>
              </template>
              
              <template v-else>
                <div class="price-block">
                  <span class="product-price text-red">{{ formatPrice(product.price) }}</span>
                </div>
              </template>
            </div>
            
            <div class="product-status">
              <span v-if="product.stock === 0" class="out-of-stock">Hết hàng</span>
              <span v-else class="in-stock">Còn {{ product.stock }} SP</span>
              <span class="rating">⭐ {{ product.rating }}</span>
            </div>
          </div>

          <div class="product-actions">
            <router-link :to="`/product/${product.id}`" class="btn btn-outline">Chi tiết</router-link>
            <button 
              @click="addToCart(product)" 
              class="btn btn-primary"
              :disabled="product.stock === 0"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios' 
import { useCartStore } from '@/stores/cartStore' 

const cartStore = useCartStore()

const hotProducts = ref([])
const isLoading = ref(true)
const error = ref(null)

const fetchHotProducts = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.get('http://localhost:8080/products/hot')
    hotProducts.value = response.data
  } catch (err) {
    console.error("Lỗi khi gọi API:", err)
    error.value = "Không thể kết nối đến máy chủ."
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchHotProducts()
})

const getImageUrl = (imageName) => {
  try {
    return require(`@/assets/image/${imageName}`)
  } catch (err) {
    console.warn(`Không tìm thấy ảnh: ${imageName}`)
    return '@/assets/ImageLoading.png' 
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

// HÀM THÊM VÀO GIỎ HÀNG (Sử dụng logic từ Backend)
const addToCart = (product) => {
  // Lấy thẳng giá trị discountedPrice do Backend trả về
  const finalDiscountedPrice = product.discountedPrice || product.price;
  
  let productToAdd = { ...product, price: finalDiscountedPrice };

  // Xử lý nếu có biến thể (Phân loại hàng)
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0]; 
    
    productToAdd = {
      ...productToAdd,
      id: `${product.id}-${firstVariant.name}`, // Tạo ID riêng cho biến thể
      name: `${product.name} (${firstVariant.name})`, 
      // Giá cuối = Giá Backend tính sẵn + Phụ phí biến thể
      price: finalDiscountedPrice + (firstVariant.extraPrice || 0) 
    };
  }

  cartStore.addToCart(productToAdd, 1);
  alert(`Đã thêm ${productToAdd.name} vào giỏ hàng với giá ưu đãi!`);
}
</script>

<style scoped>
/* 1. Hero Banner */
.hero-banner {
  background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('@/assets/bannerHome.png');
  background-size: cover;
  background-position: center;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.banner-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

/* 2. Hot Products */
.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.status-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
  color: #555;
}

.error-message {
  color: #ff4757;
  font-weight: bold;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.badge-hot {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
}

.product-img {
  width: 100%;
  height: 250px;
  object-fit: contain; 
  border-radius: 6px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
}

.product-info {
  flex-grow: 1;
}

.product-name {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #2f3542;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center; 
}

/* ========================================= */
/* CSS KHU VỰC HIỂN THỊ GIÁ (CĂN GIỮA HOÀN TOÀN) */
/* ========================================= */
.price-section {
  margin: 5px 0 15px 0;
  min-height: 50px;
  display: flex;
  align-items: flex-end; 
  justify-content: center; 
}

.price-block {
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.original-price {
  text-decoration: line-through;
  color: #a4b0be;
  font-size: 0.85rem;
  line-height: 1;
  margin-bottom: 4px;
}

.current-price-row {
  display: flex;
  align-items: center;
  gap: 6px; 
}

.discount-badge {
  background: #ff4757;
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1.2;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.text-red {
  color: #ff4757 !important;
}
/* ========================================= */

.product-status {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.in-stock { color: #2ed573; font-weight: bold; }
.out-of-stock { color: #a4b0be; font-weight: bold; text-decoration: line-through; }
.rating { color: #ffa502; }

/* 3. Buttons */
.product-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-size: 0.95rem;
  flex: 1;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.8; }
.btn-shop-now { background: #ff4757; color: white; padding: 12px 24px; font-size: 1.1rem; border-radius: 30px;}
.btn-outline { border: 1px solid #ced6e0; color: #2f3542; background: white; }
.btn-primary { background: #1e90ff; color: white; }
.btn-primary:disabled { background: #ced6e0; cursor: not-allowed; opacity: 1; }
</style>