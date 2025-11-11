
<template>
  <div class="shouye">
    <ul>
         <button v-for="(item,index) in tabList" :key="index" :class="{active:index ==activeTabIndex}" @click="activeTabIndex = index">
             {{item}}
         </button>
     </ul>
     <div class="tabCon">
         <div v-for="(itemCon,index) in tabContents" :key="index"  v-show="activeTabIndex === index">
             {{itemCon}}
         </div>
     </div>
    </div>
</template>


<script>
export default{
 data () {
      return {
        tabList:['tab1','tab2','tab3'],
        tabContents:['内容一','内容二','内容三'],
        activeTabIndex:0,
      }
  },
  methods:{
      tab (index){
          this.activeTabIndex = index
      }
 }
}

</script>


<style>
ul {
    list-style:none;
    display:inline-block;
    border:1px solid #ccc;
    height:30px;
    line-height:30px;
    width:120px;
    text-align:center;
}

.active {
    border:1px solid #ccc;
    height:30px;
    color: red;

}
</style>
