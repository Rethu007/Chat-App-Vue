import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref(null)
  /**
   * Sets the value of the username input field to the given username.
   *
   * @param {string} uname - The username to set.
   */
  function setUser(uname) {
    username.value = uname;
  }
  return { username, setUser }
})
