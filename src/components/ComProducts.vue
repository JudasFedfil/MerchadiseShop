<template>
  <div class="products-page">
    <div class="page-header">
      <h1 class="page-title">Tất Cả Sản Phẩm</h1>
      <p>Khám phá bộ sưu tập Figure và Gunpla đa dạng của chúng tôi</p>
    </div>

    <div class="filter-section">
      <div class="category-filters">
        <button 
          class="filter-btn" 
          :class="{ active: selectedCategory === 'all' }"
          @click="selectedCategory = 'all'"
        >
          Tất cả
        </button>
        
        <button 
          class="filter-btn" 
          :class="{ active: selectedCategory === 1 || selectedCategory === '1' }"
          @click="selectedCategory = 1"
        >
          Figure Anime
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: selectedCategory === 2 || selectedCategory === '2' }"
          @click="selectedCategory = 2"
        >
          Gundam (Gunpla)
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: selectedCategory === 3 || selectedCategory === '3' }"
          @click="selectedCategory = 3"
        >
          Merchandise
        </button>
      </div>
    </div>

    <div class="controls-bar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="🔍 Tìm kiếm tên sản phẩm..." 
          class="search-input"
        />
      </div>

      <div class="filter-sort-group">
        <select v-model="priceFilter" class="custom-select">
          <option value="all">Mọi mức giá</option>
          <option value="under-500">Dưới 500.000đ</option>
          <option value="500-2000">500.000đ - 2.000.000đ</option>
          <option value="over-2000">Trên 2.000.000đ</option>
        </select>

        <select v-model="sortOption" class="custom-select">
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name-asc">Tên: A - Z</option>
          <option value="name-desc">Tên: Z - A</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="status-message">
      <p>Đang tải danh sách sản phẩm...</p>
    </div>
    <div v-else-if="error" class="status-message error-message">
      <p>{{ error }}</p>
    </div>

    <div v-else class="product-grid">
      <div v-if="filteredProducts.length === 0" class="no-products">
        <div class="no-products-icon">🥲</div>
        <p>Không tìm thấy sản phẩm nào phù hợp với điều kiện tìm kiếm.</p>
        <button @click="resetFilters" class="btn btn-outline mt-3">Xóa bộ lọc</button>
      </div>

      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="product-card"
      >
        <span v-if="product.isHot" class="badge-hot">HOT</span>
        
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()

const products = ref([])
const isLoading = ref(true)
const error = ref(null)

const selectedCategory = ref('all') 
const searchQuery = ref('')
const priceFilter = ref('all')
const sortOption = ref('default')

const fetchAllProducts = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.get('http://localhost:8080/products')
    products.value = response.data.sort((a, b) => b.id - a.id)
  } catch (err) {
    console.error("Lỗi khi tải danh sách sản phẩm:", err)
    error.value = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra Server."
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAllProducts()
})

// MỌI HÀM TÍNH TOÁN ĐÃ ĐƯỢC XÓA BỎ, SỬ DỤNG DỮ LIỆU TỪ BACKEND

const filteredProducts = computed(() => {
  let result = products.value;

  if (selectedCategory.value && selectedCategory.value !== 'all') {
    result = result.filter(product => String(product.categoryId) === String(selectedCategory.value))
  }

  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(keyword));
  }

  // Lọc theo Khoảng Giá (Dựa trên GIÁ THỰC TẾ từ Backend)
  if (priceFilter.value !== 'all') {
    result = result.filter(p => {
      const finalPrice = p.discountedPrice || p.price;
      if (priceFilter.value === 'under-500') return finalPrice < 500000;
      if (priceFilter.value === '500-2000') return finalPrice >= 500000 && finalPrice <= 2000000;
      if (priceFilter.value === 'over-2000') return finalPrice > 2000000;
      return true;
    });
  }

  // Sắp xếp (Dựa trên GIÁ THỰC TẾ từ Backend)
  let sortedResult = [...result];
  if (sortOption.value === 'price-asc') {
    sortedResult.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price)); 
  } else if (sortOption.value === 'price-desc') {
    sortedResult.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price)); 
  } else if (sortOption.value === 'name-asc') {
    sortedResult.sort((a, b) => a.name.localeCompare(b.name)); 
  } else if (sortOption.value === 'name-desc') {
    sortedResult.sort((a, b) => b.name.localeCompare(a.name)); 
  }

  return sortedResult;
})

const resetFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  priceFilter.value = 'all'
  sortOption.value = 'default'
}

const getImageUrl = (imageName) => {
  try {
    return require(`@/assets/image/${imageName}`)
  } catch (err) {
    return require('@/assets/ImageLoading.jpg')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

// Thêm vào giỏ hàng
const addToCart = (product) => {
  const finalDiscountedPrice = product.discountedPrice || product.price;
  let productToAdd = { ...product, price: finalDiscountedPrice };

  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0]; 
    
    productToAdd = {
      ...productToAdd,
      id: `${product.id}-${firstVariant.name}`, 
      name: `${product.name} (${firstVariant.name})`, 
      price: finalDiscountedPrice + (firstVariant.extraPrice || 0)
    };
  }

  cartStore.addToCart(productToAdd, 1);
  alert(`Đã thêm ${productToAdd.name} vào giỏ hàng với giá ưu đãi!`);
}
</script>

<style scoped>
/* BỐ CỤC TRANG CHUNG */
.products-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2f3542;
  margin-bottom: 0.5rem;
}

/* KHU VỰC BỘ LỌC DANH MỤC */
.filter-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.category-filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid transparent;
  background-color: transparent;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #57606f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  color: #ff4757;
  background-color: #ffeef0;
}

.filter-btn.active {
  background-color: #ff4757;
  color: white;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

/* KHU VỰC TÌM KIẾM & SẮP XẾP */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #ff4757;
}

.filter-sort-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.custom-select {
  padding: 12px 15px;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #2f3542;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}

.custom-select:focus {
  border-color: #ff4757;
}

/* TRẠNG THÁI HIỂN THỊ */
.status-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
}

.error-message {
  color: #ff4757;
  font-weight: bold;
}

.no-products {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}

/* KHU VỰC GRID & THẺ SẢN PHẨM */
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
/* CSS KHU VỰC HIỂN THỊ GIÁ (CĂN GIỮA) */
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

/* KHU VỰC NÚT BẤM (Chi tiết & Thêm giỏ hàng) */
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
  transition: all 0.2s;
}

.btn:hover { opacity: 0.8; }
.btn-outline { border: 1px solid #ced6e0; color: #2f3542; background: white; }
.btn-outline:hover { background: #f1f2f6; }
.btn-primary { background: #1e90ff; color: white; }
.btn-primary:disabled { background: #ced6e0; cursor: not-allowed; opacity: 1; }
</style>