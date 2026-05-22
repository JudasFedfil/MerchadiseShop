import { createRouter, createWebHistory } from 'vue-router'
import ComHome from '../components/ComHome.vue' 
import ComProducts from '../components/ComProducts.vue'
import ComProductDetail from '../components/ComProductDetail.vue'
import ComCart from '../components/ComCart.vue'
import ComLogin from '../components/ComLogin.vue'
import ComRegister from '../components/ComRegister.vue'
import ComCheckout from '../components/ComCheckout.vue'
import ComAdmin from '../components/ComAdmin.vue'
import ComOrders from '../components/ComOrders.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ComHome 
  },
  {
    path: '/products',
    name: 'products',
    component: ComProducts
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ComProductDetail
  },
  {
    path: '/cart',
    name: 'cart',
    component: ComCart
  },
  {
    path: '/login',
    name: 'login',
    component: ComLogin
  },
  {
    path: '/register',
    name: 'register',
    component: ComRegister
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: ComCheckout
  },
  {
    path: '/admin',
    name: 'admin',
    component: ComAdmin
  },
  {
    path: '/orders',
    name: 'orders',
    component: ComOrders
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router