<template>
  <div class="flex items-center justify-center h-screen">
    <div class="bg-white rounded shadow-md p-4 w-96">
      <input
        type="text"
        v-model="inputUsername"
        placeholder="Enter your username"
        class="px-4 py-2 border rounded-lg mb-2 w-full"
      />
      <button
        @click="setUserName"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
      >
        Start Chat
      </button>
    </div>
  </div>
</template>

<script setup>
import Chat from "@/components/Chat.vue";
import { ref } from "vue";
import { useUserStore } from "../stores/counter";
import { useRouter } from "vue-router";
const router = useRouter();
const { setUser } = useUserStore();
const inputUsername = ref(null);
/**
 * Sets the user name by retrieving the value from the inputUsername element
 * and updates the user state with the new name. Then it redirects the user
 * to the "chat" route.
 *
 * @param {type} None
 * @return {type} None
 */
const setUserName = () => {
  setUser(inputUsername.value);
  router.push("chat");
};
</script>
