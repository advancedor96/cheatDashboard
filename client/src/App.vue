<script setup>
import GitHubCalendar from 'github-calendar';
import { ref } from 'vue';
import { onMounted } from 'vue';

onMounted(() => {
  GitHubCalendar(".calendar", "advancedor96", {
    responsive: false, global_stats: false
  });
});

const isLoading = ref(false);
const commitCount = ref(0);
const isCommitting = ref(false);

const handleUpdate = async () => {
  try {
    isLoading.value = true;
    // 第一次呼叫取得次數
    const response = await fetch('/api/hehe/getRandomNumberCommit');
    const data = await response.json();
    commitCount.value = data.count;

    // 開始commit
    isCommitting.value = true;
    const commitResponse = await fetch(`/api/hehe/commit?count=${commitCount.value}`);
    const commitResult = await commitResponse.json();
    alert(`Made ${commitCount.value} times commit`);


  } catch (error) {
    console.error('Error:', error);
    alert('Error. 發生錯誤！');
  } finally {
    isLoading.value = false;
    isCommitting.value = false;
  }
};
</script>

<template>
  <div>
    <div class="wrapGH">
      <div class="calendar"></div>
    </div>
    <button 
      @click="handleUpdate" 
      :disabled="isLoading || isCommitting"
      class="button">
      {{ isLoading ? 'Loading...' : 
         isCommitting ? `Committing ${commitCount} times...` : 
         'Update my github profile' }}
    </button>
  </div>
</template>

<style>
.wrapGH{
  width: 100vw;
  overflow: auto;

}
.calendar{
  max-width: 800px;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
