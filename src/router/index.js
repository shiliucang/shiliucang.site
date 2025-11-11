import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/Homepage.vue'
import Tabs from '../components/Tabs.vue'
import heise from '../components/heise.vue'
import Login from '../components/Login.vue'


const router =createRouter({


  history:createWebHistory(),
  
  
  routes:[
    {
      path:"/Login",
      component:Login
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
    }
  ]
});

export default router;
