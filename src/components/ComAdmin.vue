<template>
  <div class="admin-dashboard">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>⚙️ ADMIN PANEL</h2>
      </div>
      <ul class="sidebar-menu">
        <li :class="{ active: currentTab === 'products' }" @click="changeTab('products')">📦 Quản lý Sản phẩm</li>
        <li :class="{ active: currentTab === 'users' }" @click="changeTab('users')">👥 Quản lý Tài khoản</li>
        <li :class="{ active: currentTab === 'orders' }" @click="changeTab('orders')">🧾 Quản lý Hóa đơn</li>
        <li :class="{ active: currentTab === 'statistics' }" @click="changeTab('statistics')">📊 Thống kê Doanh thu</li>
      </ul>
      <div class="sidebar-footer">
        <router-link to="/">🔙 Về trang chủ</router-link>
      </div>
    </aside>

    <main class="main-content">
      
      <div v-if="currentTab === 'products'" class="tab-pane">
        <div class="content-header">
          <h1>Danh Sách Sản Phẩm</h1>
          <div class="header-actions">
            <button @click="showBulkModal = true" class="btn btn-outline" style="margin-right: 10px;">📥 Thêm Danh Sách</button>
            <button @click="openProductModal()" class="btn btn-primary">+ Thêm Sản Phẩm</button>
          </div>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr><th>ID</th><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Tồn kho</th><th>Đã bán</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>#{{ product.id }}</td>
                <td><img :src="getImageUrl(product.image)" class="table-img" alt="img" /></td>
                <td class="bold-text">{{ product.name }}</td>
                <td class="price-cell">
                  <div v-if="product.activeDiscount > 0">
                    <div class="original-price">{{ formatPrice(product.price) }}</div>
                    <div class="discounted-wrapper">
                      <span class="text-red">{{ formatPrice(product.discountedPrice) }}</span>
                      <sup class="discount-badge">-{{ Math.round(product.activeDiscount) }}%</sup>
                    </div>
                  </div>
                  <div v-else>
                    <span class="text-red">{{ formatPrice(product.price) }}</span>
                  </div>
                </td>
                <td>{{ product.stock }}</td>
                <td class="text-success fw-bold">{{ product.sold || 0 }}</td>
                <td class="action-btns">
                  <button @click="openProductModal(product)" class="btn-icon edit">✏️</button>
                  <button @click="deleteProduct(product.id)" class="btn-icon delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'users'" class="tab-pane">
        <div class="content-header">
          <h1>Danh Sách Tài Khoản</h1>
          <button @click="openUserModal()" class="btn btn-primary">+ Thêm Tài Khoản</button>
        </div>
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr><th>ID</th><th>Họ & Tên</th><th>Tên đăng nhập</th><th>SĐT</th><th>Quyền</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>#{{ user.id }}</td>
                <td class="bold-text">{{ user.fullName }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.phone }}</td>
                <td>
                  <span :class="user.role === 'admin' ? 'badge-admin' : 'badge-customer'">
                    {{ user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng' }}
                  </span>
                </td>
                <td class="action-btns">
                  <button @click="openUserModal(user)" class="btn-icon edit">✏️</button>
                  <button @click="deleteUser(user.id)" class="btn-icon delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'orders'" class="tab-pane">
        <div class="content-header">
          <h1>Quản Lý Hóa Đơn</h1>
        </div>
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr><th>Mã ĐH</th><th>Khách hàng</th><th>SĐT</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-if="orders.length === 0"><td colspan="6" class="text-center">Chưa có hóa đơn nào.</td></tr>
              <tr v-for="order in orders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td class="bold-text">{{ order.customerName }}</td>
                <td>{{ order.phone }}</td>
                <td class="text-red">{{ formatPrice(order.total) }}</td>
                <td><span :class="'status-' + order.status">{{ formatStatus(order.status) }}</span></td>
                <td class="action-btns">
                  <button @click="openOrderModal(order)" class="btn-icon edit" title="Chi tiết / Cập nhật">⚙️</button>
                  <button @click="exportToPdf(order.id)" class="btn-icon pdf" title="Xuất PDF">📄</button>
                  <button @click="deleteOrder(order.id)" class="btn-icon delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'statistics'" class="tab-pane">
        <div class="content-header">
          <h1>Biểu Đồ Doanh Thu</h1>
          <button @click="exportStatPdf" class="btn btn-primary">📄 Tải Báo Cáo PDF</button>
        </div>

        <div class="stat-filters">
          <select v-model="statFilter.type" @change="fetchStatistics" class="custom-select">
            <option value="month">Theo Tháng</option>
            <option value="quarter">Theo Quý</option>
            <option value="year">Theo Năm</option>
          </select>

          <select v-if="statFilter.type === 'month'" v-model="statFilter.value" @change="fetchStatistics" class="custom-select">
            <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
          </select>

          <select v-if="statFilter.type === 'quarter'" v-model="statFilter.value" @change="fetchStatistics" class="custom-select">
            <option value="1">Quý 1 (T1-T3)</option>
            <option value="2">Quý 2 (T4-T6)</option>
            <option value="3">Quý 3 (T7-T9)</option>
            <option value="4">Quý 4 (T10-T12)</option>
          </select>

          <input type="number" v-model="statFilter.year" @change="fetchStatistics" class="custom-select" placeholder="Năm (VD: 2026)" style="width: 150px" />
        </div>

        <div class="stat-total-card">
          <h3>Tổng Doanh Thu: <span class="text-red">{{ formatPrice(statData.cat1 + statData.cat2 + statData.cat3) }}</span></h3>
        </div>

        <div class="chart-container">
          <div class="chart-bar">
            <div class="bar-value">{{ formatPrice(statData.cat1) }}</div>
            <div class="bar-fill bg-blue" :style="{ height: getBarHeight(statData.cat1) + '%' }"></div>
            <div class="bar-label">Figure Anime</div>
          </div>
          
          <div class="chart-bar">
            <div class="bar-value">{{ formatPrice(statData.cat2) }}</div>
            <div class="bar-fill bg-red" :style="{ height: getBarHeight(statData.cat2) + '%' }"></div>
            <div class="bar-label">Gundam (Gunpla)</div>
          </div>
          
          <div class="chart-bar">
            <div class="bar-value">{{ formatPrice(statData.cat3) }}</div>
            <div class="bar-fill bg-green" :style="{ height: getBarHeight(statData.cat3) + '%' }"></div>
            <div class="bar-label">Merchandise</div>
          </div>
        </div>
      </div>

    </main>

    <div v-if="showBulkModal" class="modal-overlay">
      <div class="modal-content modal-md">
        <h2>📥 Thêm Nhiều Sản Phẩm (Excel/CSV)</h2>
        <div class="guest-notice" style="margin-bottom: 20px;">
          <strong>💡 Hướng dẫn định dạng cột file Excel/CSV:</strong><br>
          File của bạn cần có các cột (Header) ở dòng đầu tiên với tên CHÍNH XÁC như sau:<br>
          <code style="color: #ff4757;">Ten, Gia, GiamGia, TonKho, DanhMuc, TenAnh, MoTa, Hot</code>
          <ul style="margin-top: 5px; font-size: 0.9rem; color: #57606f;">
            <li><b>DanhMuc:</b> Điền số (1 = Figure, 2 = Gunpla, 3 = Merchandise)</li>
            <li><b>TenAnh:</b> Tên file ảnh (VD: gundam.png)</li>
            <li><b>Hot:</b> TRUE hoặc FALSE</li>
          </ul>
        </div>
        <form @submit.prevent="handleBulkSubmit" class="admin-form">
          <div class="form-group"><label>1. Chọn file Excel hoặc CSV *</label><input type="file" @change="onBulkFileChange" accept=".xlsx, .xls, .csv" required /></div>
          <div class="form-group">
            <label>2. Tải lên danh sách Hình ảnh *</label>
            <input type="file" multiple @change="onBulkImagesChange" accept="image/*" />
            <small style="color: #747d8c;">(Có thể quét chọn nhiều ảnh cùng lúc để lưu vào máy chủ)</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showBulkModal = false" class="btn btn-outline" :disabled="isUploadingBulk">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="isUploadingBulk">{{ isUploadingBulk ? '⏳ Đang xử lý...' : '🚀 Bắt đầu Nhập dữ liệu' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showProductModal" class="modal-overlay">
      <div class="modal-content modal-lg">
        <h2>{{ isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h2>
        <form @submit.prevent="saveProduct" class="admin-form">
          <div class="form-group"><label>Tên sản phẩm *</label><input type="text" v-model="productForm.name" required /></div>
          <div class="form-row">
            <div class="form-group"><label>Giá gốc (VNĐ) *</label><input type="number" v-model.number="productForm.price" required min="0" /></div>
            <div class="form-group"><label>Giảm giá (%)</label><input type="number" v-model.number="productForm.discount" min="0" max="100" /></div>
            <div class="form-group"><label>Tồn kho (Tổng) *</label><input type="number" v-model.number="productForm.stock" required min="0" /></div>
            <div class="form-group">
              <label>Danh mục *</label>
              <select v-model.number="productForm.categoryId" required>
                <option value="1">Figure Anime</option><option value="2">Gundam (Gunpla)</option><option value="3">Merchandise</option>
              </select>
            </div>
          </div>
          
          <div class="form-row" v-if="productForm.discount > 0" style="background: #ffeef0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div class="form-group mb-0"><label style="color: #ff4757;">Bắt đầu Sale (Để trống: Sale ngay)</label><input type="datetime-local" v-model="productForm.discountStartDate" /></div>
            <div class="form-group mb-0"><label style="color: #ff4757;">Kết thúc Sale (Để trống: Vô thời hạn)</label><input type="datetime-local" v-model="productForm.discountEndDate" /></div>
          </div>

          <div class="variants-section">
            <div class="variants-header"><label>Phân loại hàng (Không bắt buộc)</label><button type="button" @click="addVariant" class="btn btn-sm btn-outline">+ Thêm phân loại</button></div>
            <div v-if="productForm.variants.length === 0" class="empty-variants">Sản phẩm này không có phân loại.</div>
            <div v-for="(variant, index) in productForm.variants" :key="index" class="variant-row">
              <div class="form-group mb-0 flex-2"><input type="text" v-model="variant.name" placeholder="Tên (VD: Màu đỏ)" required /></div>
              <div class="form-group mb-0 flex-1"><input type="number" v-model.number="variant.extraPrice" placeholder="Giá cộng thêm (VNĐ)" /></div>
              <div class="form-group mb-0 flex-1"><input type="number" v-model.number="variant.stock" placeholder="Tồn kho" required min="0"/></div>
              <button type="button" @click="removeVariant(index)" class="btn-icon delete mb-1" title="Xóa phân loại này">✖</button>
            </div>
          </div>
          
          <div class="form-group mt-3">
            <label>Hình ảnh *</label>
            <div class="dropzone" :class="{ 'dragging': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="triggerFileInput">
              <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" class="hidden-input" />
              <div v-if="!imagePreview" class="dropzone-content"><span class="upload-icon">📁</span><p>Kéo thả ảnh vào đây hoặc Bấm chọn</p></div>
              <div v-else class="preview-container">
                <img :src="imagePreview" class="preview-img" />
                <div class="file-name-overlay"><span>{{ productForm.image }}</span><button type="button" @click.stop="clearImage" class="btn-clear-img">✖</button></div>
              </div>
            </div>
          </div>
          <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="productForm.isHot"> Đánh dấu là Sản phẩm HOT 🔥</label></div>
          <div class="modal-actions"><button type="button" @click="showProductModal = false" class="btn btn-outline">Hủy</button><button type="submit" class="btn btn-primary">Lưu Sản Phẩm</button></div>
        </form>
      </div>
    </div>

    <div v-if="showUserModal" class="modal-overlay">
      <div class="modal-content modal-sm">
        <h2>{{ isEditing ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản' }}</h2>
        <form @submit.prevent="saveUser" class="admin-form">
          <div class="form-group"><label>Họ và Tên</label><input type="text" v-model="userForm.fullName" required /></div>
          <div class="form-group"><label>Tên đăng nhập</label><input type="text" v-model="userForm.username" required :disabled="isEditing" /></div>
          <div class="form-group"><label>Mật khẩu</label><input type="text" v-model="userForm.password" required /></div>
          <div class="form-group">
            <label>Phân quyền</label>
            <select v-model="userForm.role"><option value="customer">Khách hàng</option><option value="admin">Quản trị viên</option></select>
          </div>
          <div class="modal-actions"><button type="button" @click="showUserModal = false" class="btn btn-outline">Hủy</button><button type="submit" class="btn btn-primary">Lưu</button></div>
        </form>
      </div>
    </div>

    <div v-if="showOrderModal" class="modal-overlay">
      <div class="modal-content order-modal">
        <h2>Chi Tiết & Cập Nhật Đơn Hàng #{{ orderForm.id }}</h2>
        <div class="order-info-group">
          <p><strong>Khách hàng:</strong> {{ orderForm.customerName }}</p><p><strong>Số điện thoại:</strong> {{ orderForm.phone }}</p>
          <p><strong>Địa chỉ giao:</strong> {{ orderForm.address }}</p><p><strong>Ngày đặt:</strong> {{ orderForm.createdAt }}</p>
        </div>
        <div class="order-items-section">
          <h3>Danh sách sản phẩm</h3>
          <table class="items-table">
            <thead><tr><th>Tên SP</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
            <tbody>
              <tr v-for="(item, idx) in parseItems(orderForm.items)" :key="idx">
                <td class="item-name-cell">{{ item.name }}</td><td>{{ formatPrice(item.price) }}</td>
                <td>x{{ item.quantity }}</td><td class="item-total-cell">{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="order-total-row"><strong>Tổng cộng: <span class="text-danger">{{ formatPrice(orderForm.total) }}</span></strong></div>
        </div>
        <form @submit.prevent="saveOrder" class="admin-form">
          <div class="form-group mt-3">
            <label>Cập nhật trạng thái:</label>
            <select v-model="orderForm.status" class="status-select" required>
              <option value="pending">⏳ Chờ xác nhận</option><option value="shipping">🚚 Đang giao hàng</option>
              <option value="completed">✅ Đã hoàn thành</option><option value="cancelled">❌ Đã hủy</option>
            </select>
          </div>
          <div class="modal-actions"><button type="button" @click="showOrderModal = false" class="btn btn-outline">Đóng</button><button type="submit" class="btn btn-primary">Lưu Trạng Thái</button></div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx' 

// STATE CHUNG
const currentTab = ref('products')
const isEditing = ref(false)

const changeTab = (tabName) => {
  currentTab.value = tabName
  if (tabName === 'products') fetchProducts()
  if (tabName === 'users') fetchUsers()
  if (tabName === 'orders') fetchOrders()
  if (tabName === 'statistics') fetchStatistics() // Thêm fetch thống kê khi qua tab
}

onMounted(() => {
  fetchProducts()
})

// ==========================================
// LOGIC THỐNG KÊ
// ==========================================
const statFilter = reactive({
  type: 'month',
  value: new Date().getMonth() + 1, // Mặc định tháng hiện tại
  year: new Date().getFullYear()    // Mặc định năm hiện tại
})

const statData = ref({ cat1: 0, cat2: 0, cat3: 0 })

const fetchStatistics = async () => {
  try {
    const res = await axios.get(`http://localhost:8080/statistics/revenue`, {
      params: { type: statFilter.type, value: statFilter.value, year: statFilter.year }
    });
    statData.value = res.data;
  } catch (error) {
    console.error("Lỗi tải thống kê:", error);
  }
}

// Logic tính chiều cao cột CSS
const getBarHeight = (val) => {
  const max = Math.max(statData.value.cat1, statData.value.cat2, statData.value.cat3, 1); 
  return (val / max) * 100;
}

const exportStatPdf = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/statistics/export-pdf`, {
      params: { type: statFilter.type, value: statFilter.value, year: statFilter.year },
      responseType: 'blob' 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCaoDoanhThu_${statFilter.type}_${statFilter.year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Không thể xuất báo cáo lúc này!");
  }
}


// ==========================================
// LOGIC IMPORT EXCEL (THÊM DANH SÁCH)
// ==========================================
const showBulkModal = ref(false); const bulkFile = ref(null); const bulkImages = ref([]); const isUploadingBulk = ref(false)
const onBulkFileChange = (e) => { bulkFile.value = e.target.files[0]; }
const onBulkImagesChange = (e) => { bulkImages.value = Array.from(e.target.files); }

const handleBulkSubmit = async () => {
  if (!bulkFile.value) return alert('Vui lòng chọn file Excel/CSV!');
  isUploadingBulk.value = true;
  try {
    if (bulkImages.value.length > 0) {
      for (const file of bulkImages.value) {
        const formData = new FormData(); formData.append('file', file);
        await axios.post('http://localhost:8080/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonProducts = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let successCount = 0;
        for (const row of jsonProducts) {
          const product = {
            name: row['Ten'] || 'Sản phẩm chưa đặt tên', price: Number(row['Gia']) || 0, discount: Number(row['GiamGia']) || 0,
            stock: Number(row['TonKho']) || 0, categoryId: Number(row['DanhMuc']) || 1, image: row['TenAnh'] || '',
            description: row['MoTa'] || '', isHot: String(row['Hot']).toUpperCase() === 'TRUE', sold: 0, variants: [], 
            discountStartDate: null, discountEndDate: null 
          };
          await axios.post('http://localhost:8080/products', product);
          successCount++;
        }
        alert(`✅ Đã nhập thành công ${successCount} sản phẩm!`);
        showBulkModal.value = false; fetchProducts(); 
      } catch (err) { alert("Định dạng file Excel không đúng!"); } finally { isUploadingBulk.value = false; }
    };
    reader.readAsArrayBuffer(bulkFile.value);
  } catch (error) { alert("Có lỗi xảy ra trong quá trình truyền dữ liệu!"); isUploadingBulk.value = false; }
}

// ==========================================
// LOGIC SẢN PHẨM & BIẾN THỂ
// ==========================================
const products = ref([]); const showProductModal = ref(false)
const productForm = reactive({ id: null, name: '', categoryId: 1, price: 0, discount: 0, discountStartDate: null, discountEndDate: null, stock: 0, sold: 0, image: '', description: '', isHot: false, rating: 5, variants: [] })
const addVariant = () => { productForm.variants.push({ name: '', extraPrice: 0, stock: 0 }) }
const removeVariant = (index) => { productForm.variants.splice(index, 1) }

const isDragging = ref(false); const imagePreview = ref(null); const fileInput = ref(null); const selectedFile = ref(null);
const triggerFileInput = () => { if (!imagePreview.value && fileInput.value) fileInput.value.click() }
const handleDrop = (e) => { isDragging.value = false; processFile(e.dataTransfer.files[0]) }
const handleFileSelect = (e) => { processFile(e.target.files[0]) }
const processFile = (file) => { if (file && file.type.startsWith('image/')) { selectedFile.value = file; productForm.image = file.name; imagePreview.value = URL.createObjectURL(file); } }
const clearImage = () => { productForm.image = ''; imagePreview.value = null; selectedFile.value = null; if (fileInput.value) fileInput.value.value = ''; }

const fetchProducts = async () => { const res = await axios.get('http://localhost:8080/products'); products.value = res.data.sort((a, b) => b.id - a.id); }
const openProductModal = (product = null) => {
  clearImage()
  if (product) {
    isEditing.value = true; Object.assign(productForm, product)
    productForm.variants = product.variants ? JSON.parse(JSON.stringify(product.variants)) : []
    productForm.discount = product.discount || 0; productForm.discountStartDate = product.discountStartDate || null; productForm.discountEndDate = product.discountEndDate || null;
    imagePreview.value = getImageUrl(product.image)
  } else {
    isEditing.value = false; Object.assign(productForm, { id: null, name: '', price: 0, discount: 0, discountStartDate: null, discountEndDate: null, stock: 0, sold: 0, image: '', categoryId: 1, isHot: false, variants: [] })
  }
  showProductModal.value = true
}

const saveProduct = async () => {
  try {
    const payload = { ...productForm };
    payload.discountStartDate = payload.discountStartDate || null; payload.discountEndDate = payload.discountEndDate || null;
    if (selectedFile.value) {
      const formData = new FormData(); formData.append('file', selectedFile.value);
      try { const uploadRes = await axios.post('http://localhost:8080/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); payload.image = uploadRes.data; } 
      catch (uploadError) { alert('Không thể tải ảnh lên thư mục!'); return; }
    }
    payload.price = Number(payload.price) || 0; payload.discount = Math.min(100, Math.max(0, Number(payload.discount) || 0));
    payload.stock = Number(payload.stock) || 0; payload.sold = Number(payload.sold) || 0; payload.categoryId = Number(payload.categoryId) || 1; payload.isHot = Boolean(payload.isHot);
    payload.variants = payload.variants.map(v => ({ name: v.name, extraPrice: Number(v.extraPrice) || 0, stock: Number(v.stock) || 0 }));

    if (isEditing.value) { await axios.put(`http://localhost:8080/products/${payload.id}`, payload); alert('Cập nhật thành công!'); } 
    else { delete payload.id; await axios.post('http://localhost:8080/products', payload); alert('Thêm mới thành công!'); }
    showProductModal.value = false; fetchProducts();
  } catch (error) { alert(`Lỗi lưu sản phẩm!`); }
}
const deleteProduct = async (id) => { if (confirm('Xóa sản phẩm này?')) { await axios.delete(`http://localhost:8080/products/${id}`); fetchProducts() } }

// ==========================================
//(Users, Orders, Export PDF)
// ==========================================
const users = ref([]); const showUserModal = ref(false); const userForm = reactive({ id: null, fullName: '', username: '', password: '', role: 'customer', phone: '' })
const fetchUsers = async () => { const res = await axios.get('http://localhost:8080/users'); users.value = res.data; }
const openUserModal = (user = null) => { if (user) { isEditing.value = true; Object.assign(userForm, user); } else { isEditing.value = false; Object.assign(userForm, { id: null, fullName: '', username: '', password: '', role: 'customer', phone: '' }); } showUserModal.value = true; }
const saveUser = async () => { if (isEditing.value) { await axios.put(`http://localhost:8080/users/${userForm.id}`, userForm); } else { await axios.post('http://localhost:8080/users', userForm); } showUserModal.value = false; fetchUsers(); }
const deleteUser = async (id) => { if (confirm('Xóa tài khoản này?')) { await axios.delete(`http://localhost:8080/users/${id}`); fetchUsers(); } }

const orders = ref([]); const showOrderModal = ref(false); const orderForm = reactive({ id: null, customerName: '', phone: '', address: '', createdAt: '', status: '', items: '[]', total: 0 })
const fetchOrders = async () => { try { const res = await axios.get('http://localhost:8080/orders'); orders.value = res.data.map(order => ({ ...order })).sort((a, b) => b.id - a.id); } catch (error) { orders.value = []; } }
const openOrderModal = (order) => { Object.assign(orderForm, order); showOrderModal.value = true; }
const saveOrder = async () => { try { await axios.patch(`http://localhost:8080/orders/${orderForm.id}`, { status: orderForm.status }); alert('Đã cập nhật!'); showOrderModal.value = false; fetchOrders(); fetchProducts(); } catch (error) { alert('Lỗi cập nhật!'); } }
const deleteOrder = async (id) => { if (confirm('Xóa hóa đơn?')) { try { await axios.delete(`http://localhost:8080/orders/${String(id)}`); fetchOrders(); } catch (error) { alert('Lỗi máy chủ!'); } } }

const exportToPdf = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:8080/orders/${orderId}/export-pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a'); link.href = url; link.setAttribute('download', `HoaDon_${orderId}.pdf`); document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
  } catch (error) { alert("Không thể xuất file PDF!"); }
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
const getImageUrl = (name) => { try { return require(`@/assets/image/${name}`) } catch { return '' } }
const formatStatus = (status) => { const map = { pending: '⏳ Chờ xác nhận', shipping: '🚚 Đang giao', completed: '✅ Hoàn thành', cancelled: '❌ Đã hủy' }; return map[status] || status; }
const parseItems = (itemsData) => { if (!itemsData) return []; let parsed = itemsData; while (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch (e) { break } } return Array.isArray(parsed) ? parsed : [] }
</script>

<style scoped>
.admin-dashboard { display: flex; min-height: 100vh; background: #f4f6f9; }
.sidebar { width: 260px; background: #2f3542; color: white; display: flex; flex-direction: column; }
.sidebar-header { padding: 20px; text-align: center; border-bottom: 1px solid #57606f; }
.sidebar-header h2 { font-size: 1.5rem; margin: 0; color: #ff4757; }
.sidebar-menu { list-style: none; padding: 0; margin: 0; flex: 1; }
.sidebar-menu li { padding: 18px 25px; cursor: pointer; font-size: 1.1rem; transition: 0.2s; border-left: 4px solid transparent; }
.sidebar-menu li:hover { background: #57606f; }
.sidebar-menu li.active { background: #ff4757; border-left-color: white; font-weight: bold; }
.sidebar-footer { padding: 20px; text-align: center; border-top: 1px solid #57606f; }
.sidebar-footer a { color: #a4b0be; text-decoration: none; }
.sidebar-footer a:hover { color: white; }
.main-content { flex: 1; padding: 30px; overflow-y: auto; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.content-header h1 { color: #2f3542; margin: 0; }
.table-container { background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); overflow: hidden; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th, .admin-table td { padding: 15px 20px; border-bottom: 1px solid #f1f2f6; }
.admin-table th { background: #f8f9fa; color: #747d8c; text-transform: uppercase; font-size: 0.9rem; }
.admin-table tr:hover { background: #fcfcfc; }
.table-img { width: 60px; height: 60px; object-fit: contain; background: #f8f9fa; border-radius: 6px; border: 1px solid #eee; }
.badge-admin { background: #ff4757; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;}
.badge-customer { background: #1e90ff; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.85rem; }
.status-pending { color: #ffa502; font-weight: bold; }
.status-shipping { color: #1e90ff; font-weight: bold; }
.status-completed { color: #2ed573; font-weight: bold; }
.status-cancelled { color: #ff4757; font-weight: bold; text-decoration: line-through; }
.text-red { color: #ff4757; font-weight: bold; font-size: 1.05rem; }
.text-success { color: #2ed573; }
.bold-text { font-weight: bold; color: #2f3542; }
.fw-bold { font-weight: bold; }
.price-cell { line-height: 1.3; }
.original-price { font-size: 0.85rem; color: #a4b0be; text-decoration: line-through; margin-bottom: 2px; }
.discounted-wrapper { display: inline-flex; align-items: flex-start; gap: 4px; }
.discount-badge { font-size: 0.7rem; background: #ff4757; color: white; padding: 2px 5px; border-radius: 4px; font-weight: bold; }
.action-btns { display: flex; gap: 10px; }
.btn-icon { background: none; border: none; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
.btn-icon:hover { transform: scale(1.2); }
.btn-icon.pdf:hover { filter: hue-rotate(90deg); } 
.btn { padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-sm { padding: 6px 12px; font-size: 0.9rem; }
.btn-primary { background: #ff4757; color: white; }
.btn-outline { background: white; border: 1px solid #ced6e0; color: #2f3542; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-sm { max-width: 400px; }
.modal-md { max-width: 500px; } 
.modal-lg { max-width: 750px; } 
.modal-content h2 { margin-bottom: 20px; border-bottom: 2px solid #f1f2f6; padding-bottom: 10px; }
.form-row { display: flex; gap: 20px; }
.form-group { margin-bottom: 15px; flex: 1; }
.form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #2f3542; }
.form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ced6e0; border-radius: 6px; font-family: inherit; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: normal !important; }
.checkbox-label input { width: auto; transform: scale(1.2); }
.status-select { font-size: 1.1rem; font-weight: bold; }
.modal-actions { display: flex; justify-content: flex-end; gap: 15px; border-top: 2px solid #f1f2f6; padding-top: 20px; margin-top: 20px; }
.variants-section { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 15px; }
.variants-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.variants-header label { margin: 0; font-size: 1.05rem; color: #2f3542; }
.empty-variants { text-align: center; color: #a4b0be; font-style: italic; font-size: 0.9rem; padding: 10px 0; }
.variant-row { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #ced6e0; }
.variant-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }
.dropzone { border: 2px dashed #ced6e0; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; background: #f8f9fa; min-height: 150px; display: flex; align-items: center; justify-content: center; }
.dropzone.dragging { border-color: #1e90ff; background-color: #eaf4ff; }
.hidden-input { display: none; }
.upload-icon { font-size: 2.5rem; display: block; margin-bottom: 10px; }
.preview-container { display: flex; flex-direction: column; align-items: center; width: 100%; }
.preview-img { max-height: 150px; object-fit: contain; border-radius: 8px; }
.file-name-overlay { margin-top: 10px; display: flex; align-items: center; gap: 15px; background: #2f3542; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; }
.btn-clear-img { background: none; border: none; color: #ff4757; font-size: 1.2rem; cursor: pointer; }
.order-modal { max-width: 650px !important; }
.order-info-group { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef; }
.order-info-group p { margin: 5px 0; color: #2f3542; }
.order-items-section h3 { font-size: 1.1rem; margin-bottom: 10px; border-bottom: 2px solid #f1f2f6; padding-bottom: 8px; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 0.95rem; }
.items-table th, .items-table td { padding: 10px; border-bottom: 1px solid #f1f2f6; text-align: right; }
.items-table th { background: #f8f9fa; color: #57606f; }
.items-table th:first-child, .items-table td:first-child { text-align: left; }
.item-name-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.item-total-cell { font-weight: bold; color: #2f3542; }
.order-total-row { text-align: right; font-size: 1.2rem; margin-bottom: 20px; border-top: 1px dashed #ced6e0; padding-top: 15px; }
.guest-notice { background: #eaf4ff; padding: 15px; border-radius: 6px; border-left: 4px solid #1e90ff; }

/* CSS DÀNH CHO TAB THỐNG KÊ */
.stat-filters { display: flex; gap: 15px; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.stat-total-card { background: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.stat-total-card h3 { margin: 0; font-size: 1.8rem; color: #2f3542; }
.chart-container { display: flex; justify-content: space-around; align-items: flex-end; height: 400px; background: white; padding: 40px 20px 20px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-bottom: 2px solid #ced6e0; }
.chart-bar { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 25%; height: 100%;}
.bar-value { margin-bottom: 10px; font-weight: bold; color: #2f3542; }
.bar-fill { width: 100%; border-radius: 8px 8px 0 0; transition: height 0.8s ease-out; min-height: 5px; }
.bar-label { margin-top: 15px; font-weight: bold; color: #57606f; text-align: center; }
.bg-blue { background: linear-gradient(to top, #1e90ff, #70a1ff); }
.bg-red { background: linear-gradient(to top, #ff4757, #ff6b81); }
.bg-green { background: linear-gradient(to top, #2ed573, #7bed9f); }
</style>