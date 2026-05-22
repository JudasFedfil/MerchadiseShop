<template>
  <div class="auth-page">
    <div class="auth-box">
      <h2>Đăng Nhập</h2>
      <p class="subtitle">Chào mừng bạn quay lại MerchShop</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" v-model="username" required placeholder="Nhập username" />
        </div>
        
        <div class="form-group">
          <label>Mật khẩu</label>
          <input type="password" v-model="password" required placeholder="Nhập mật khẩu" />
        </div>
        
        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        
        <button type="submit" class="btn btn-primary btn-block">Đăng Nhập</button>
      </form>
      
      <p class="switch-auth">
        Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  const isSuccess = await authStore.login(username.value, password.value)
  if (isSuccess) {
    alert("Đăng nhập thành công!");
    router.push('/');
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
}
</script>

<style scoped>
/* CSS Dùng chung cho cả 2 trang */
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 70vh; }
.auth-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); width: 100%; max-width: 400px; }
.auth-box h2 { text-align: center; color: #2f3542; margin-bottom: 5px; font-size: 2rem;}
.subtitle { text-align: center; color: #747d8c; margin-bottom: 25px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #2f3542; }
.form-group input { width: 100%; padding: 12px; border: 1px solid #ced6e0; border-radius: 6px; font-size: 1rem; }
.form-group input:focus { border-color: #ff4757; outline: none; }
.btn-block { width: 100%; padding: 14px; font-size: 1.1rem; border: none; border-radius: 6px; cursor: pointer; background: #ff4757; color: white; font-weight: bold; margin-top: 10px; }
.btn-block:hover { background: #ff6b81; }
.error-msg { color: #ff4757; font-size: 0.9rem; margin-bottom: 15px; text-align: center; font-weight: bold; }
.switch-auth { text-align: center; margin-top: 20px; color: #57606f; }
.switch-auth a { color: #1e90ff; text-decoration: none; font-weight: bold; }
</style>