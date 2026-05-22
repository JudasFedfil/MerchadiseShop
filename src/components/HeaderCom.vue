<template>
  <header class="main-header">
    <div class="logo">
      <router-link to="/"> MerchShop</router-link>
    </div>
    
    <nav class="nav-links">
      <router-link to="/">Trang Chủ</router-link>
      <router-link to="/products">Sản Phẩm</router-link>
      <router-link to="/orders">Đơn Hàng</router-link> 
    </nav>
    
    <div class="header-actions">
      <div class="auth-links">
        <template v-if="authStore.user">
          <span class="user-greeting" v-if="authStore.user">
            Chào, {{ authStore.user.fullName || authStore.user.fullname || authStore.user.full_name || authStore.user.username }}
          </span>
          
          <router-link 
            v-if="authStore.user.role === 'admin'" 
            to="/admin" 
            class="auth-btn admin-btn"
          >
            ⚙️ Quản lý
          </router-link>

          <button @click="authStore.logout" class="auth-btn logout-btn">Đăng xuất</button>
        </template>
        
        <template v-else>
          <router-link to="/login" class="auth-btn login-btn">Đăng nhập</router-link>
          <router-link to="/register" class="auth-btn register-btn">Đăng ký</router-link>
        </template>
      </div>

      <div class="cart-info">
        <router-link to="/cart" class="cart-link">
          🛒 Giỏ hàng ({{ cartStore.totalItems }})
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const cartStore = useCartStore()
const authStore = useAuthStore()
</script>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #ff4757;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #2f3542;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-links a:hover, .nav-links a.router-link-active {
  color: #ff4757;
}

/* --- Style cho cụm bên phải --- */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px; /* Khoảng cách giữa cụm Auth và Giỏ hàng */
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 10px; /* Khoảng cách giữa 2 nút Đăng nhập/Đăng ký */
}

.auth-btn {
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.login-btn {
  color: #2f3542;
  border: 1px solid #ced6e0;
  background-color: transparent;
}

.login-btn:hover {
  background-color: #f1f2f6;
}

.register-btn {
  background-color: #ff4757;
  color: white;
  border: 1px solid #ff4757;
}

.register-btn:hover {
  background-color: #ff6b81;
}

.cart-link {
  text-decoration: none;
  color: #2f3542;
  font-weight: bold;
  background-color: #f1f2f6;
  padding: 8px 15px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.cart-link:hover {
  background-color: #e2e6ea;
}

.admin-btn { background: #2ed573; color: white; border: none; } 
.admin-btn:hover { background: #26ae60; }
</style>