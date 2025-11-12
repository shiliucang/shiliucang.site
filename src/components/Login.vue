<template>
    <h5>登录</h5>
    <form @submit.prevent="login">
         <div>
            <label for="">用户名</label>
            <input type="text" v-model="username">
        </div>
        <div>
            <label for="">密码</label>
            <input type="password" v-model="password">
        </div>
        <button >登录</button>
    </form>

</template>

<script>

export default {
    data(){
            return{
                username:"",
                password:""

            }
        },
    methods:{
        login(){
            if(this.username === "shiliucang" &&  this.password === "ghy19990326"){
                    this.$router.push("/Homepage")
            }else{
                alert("用户名或密码错误!!!");
            }
        }
    }
}
</script>