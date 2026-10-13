<script setup lang="ts">
// import { ref } from 'vue'

// const imgPath = ref<string[]>([])

for (let i = 1; i <= 4; i++) {
  // imgPath.value.push(`public/${i}.jpg`)
}
</script>

<template>
  <div class="block text-center new-class" m="t-4">
    <h2>第一个必会的carousel形式</h2>
    <el-carousel trigger="click" height="150px">
      <el-carousel-item v-for="item in imgPath" :key="item">
        <img :src="item" class="image">
      </el-carousel-item>
    </el-carousel>

    <h2>第二个必会的carousel形式</h2>
    <el-carousel trigger="click" :interval="4000" type="card" height="200px" arrow="never">
      <el-carousel-item v-for="item in imgPath" :key="item" class="i">
        <img :src="item" class="image">
      </el-carousel-item>
    </el-carousel>

    <h2>第三个必会的carousel形式</h2>
    <el-carousel trigger="click" height="400px" direction="vertical" type="card" :autoplay="true">
      <el-carousel-item v-for="item in imgPath" :key="item">
        <img :src="item" class="image">
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.i {
  border-radius: 10px;
}

.image {
  display: block;
  width: 100%;
  height: 100%;
  object-position: center;
  object-fit: cover;
}

.new-class {
  box-sizing: border-box;
  width: 500px;
  height: 160px;
  position: relative;
  left: calc(50vw - 250px);
}

.demonstration {
  color: var(--el-text-color-secondary);
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
