<template>
      <!-- Chat Header -->
      <div class="p-4 bg-white shadow-lg z-10 border-b border-gray-200">
      <h1 class="text-xl font-semibold">Chat user: {{username}}</h1>
    </div>
  <div class="container mx-auto">
    <Chat :username="username"></Chat>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import Chat from "../components/Chat.vue";
import { useUserStore } from "../stores/counter";
const router = useRouter();
const { username } = useUserStore();

if (username == null) router.push("/");
</script>
