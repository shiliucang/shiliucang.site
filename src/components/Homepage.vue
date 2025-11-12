<template>
    <div class="homepage">
        <div class="login" @click="clicklogin"><p>{{  login  }}</p></div>
        <div class="start" @click="clickstart"><p>{{  start  }}</p></div>        
    </div>
    <router-view></router-view>
</template>

<script>

    export default {
        data(){
            return {
                login: "登录",
                start:"开始"
                }
        },
        methods:{
            clicklogin(){
            this.$router.push('/Tabs');
        },
        clickstart(){
             this.$router.push('/Tabs');
        }
        }

    }

</script>

<style scoped>
.homepage {
    display:flex;
    justify-content: space-between;
}
.login {
    border: none;
    width: 1.2rem;
    height: 0.8rem;
    border-radius: 0.05rem;
    background:#c3c3c3;
    display: flex;
    justify-content: center;
    align-content: center;
}
.login p{
    width: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.2rem;
    color: #000;
    letter-spacing: 0.1rem;
}
.start {
    border: none;
    width: 1.2rem;
    height: 0.8rem;
    border-radius: 0.05rem;
    background:#000;
    display: flex;
    justify-content: center;
    align-content: center;
}
.start p{
    width: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.2rem;
    color: #f3f3f3;
    letter-spacing: 0.1rem;
}
</style>
