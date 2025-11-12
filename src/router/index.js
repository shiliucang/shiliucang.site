import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/Homepage.vue'
import Tabs from '../components/Tabs.vue'
import heise from '../components/heise.vue'
import Login from '../components/Login.vue'
import Menuhome from '../components/Home/Kitchen/Menuhome.vue'
import Menu from '../components/Home/Kitchen/Menu.vue'
import Refrigerator from '../components/Home/Kitchen/Refrigerator.vue'

const routes =[
  {
    path:"/",
    redirect:'/Login'
  },
   {
      path:"/",
      component:HomePage
    },
    {
      path:"/Tabs",
      component:Tabs
    },
    {
      path:"/heise",
      component:heise
    },
    {
      path:"/Login",
      component:Login
    },
    {
      path:"/Menu",
      component:Menu
    },
    {
      path:"/Menuhome",
      component:Menuhome
    },
    {
      path:"/Refrigerator",
      component:Refrigerator
    }
  ]

  const router = createRouter({
  history: createWebHashHistory(), // 固定hash模式，匹配#路径
  routes // 注册路由规则

});

export default router;
