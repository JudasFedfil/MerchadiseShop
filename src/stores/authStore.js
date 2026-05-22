import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // Lấy dữ liệu từ localStorage khi vừa khởi động web
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // ==========================================
  // 1. HÀM ĐĂNG NHẬP (ĐÃ FIX LỖI)
  // ==========================================
  const login = async (username, password) => {
    try {
      // 1. KHÔNG dùng .value ở đây vì tham số truyền vào đã là chữ (String)
      const response = await axios.post('http://localhost:8080/users/login', {
        username: username,
        password: password
      });

      if (response.data && response.data !== "") {
        // 2. Setup store dùng ref(), nên phải gán bằng user.value
        user.value = response.data;
        
        // 3. Lưu vào localStorage để không bị đăng xuất khi tải lại trang
        localStorage.setItem('user', JSON.stringify(user.value));
        
        return true; // Báo hiệu đăng nhập thành công
      }
      return false;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      // Khi Backend Spring Boot báo sai mật khẩu (Mã 401), axios sẽ văng vào catch này
      return false; 
    }
  }

  // ==========================================
  // 2. HÀM ĐĂNG KÍ
  // ==========================================
  const register = async (userData) => {
    try {
      const responseUsers = await axios.get('http://localhost:8080/users')
      const isExist = responseUsers.data.some(u => u.username === userData.username.trim())

      if (isExist) {
        return { success: false, message: "Tên đăng nhập đã tồn tại!" }
      }

      const newUser = { ...userData, role: "customer" }
      const response = await axios.post('http://localhost:8080/users', newUser)
      
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(user.value))
      alert("Đăng ký thành công!")
      router.push('/')
      return { success: true }
    } catch (error) {
      console.error("Lỗi đăng ký:", error)
      return { success: false, message: "Lỗi kết nối máy chủ!" }
    }
  }

  // ==========================================
  // 3. HÀM ĐĂNG XUẤT
  // ==========================================
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { user, login, register, logout }
})