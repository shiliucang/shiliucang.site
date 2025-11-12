<template>
    <div class="homepage">
        <div class="login" @click="clicklogin"><p>{{  login  }}</p></div>
        <div class="start" @click="clickstart"><p>{{  start  }}</p></div>        
    </div>
    <router-view></router-view>
</template>
