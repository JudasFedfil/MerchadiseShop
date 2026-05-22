<template>
  <div class="auth-page">
    <div class="auth-box">
      <h2>Đăng Ký</h2>
      <p class="subtitle">Tạo tài khoản để nhận nhiều ưu đãi</p>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Họ và Tên</label>
          <input type="text" v-model="formData.fullName" required placeholder="VD: Nguyễn Văn A" />
        </div>

        <div class="form-group">
          <label>Số điện thoại</label>
          <input type="tel" v-model="formData.phone" required placeholder="VD: 0901234567" />
        </div>

        <div class="form-group">
          <label>Tên đăng nhập (Username)</label>
          <input type="text" v-model="formData.username" required placeholder="Viết liền không dấu" />
        </div>
        
        <div class="form-group">
          <label>Mật khẩu</label>
          <input type="password" v-model="formData.password" required placeholder="Tối thiểu 6 ký tự" />
        </div>
        
        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        
        <button type="submit" class="btn btn-primary btn-block">Tạo Tài Khoản</button>
      </form>
      
      <p class="switch-auth">
        Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const errorMessage = ref('')

const formData = reactive({
  fullName: '',
  phone: '',
  username: '',
  password: ''
})

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (formData.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
    return
  }

  const result = await authStore.register(formData)
  if (!result.success) {
    errorMessage.value = result.message
  }
}
</script>

<style scoped>
/* Copy y hệt đoạn CSS từ file ComLogin.vue dán vào đây để giao diện đồng nhất */
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