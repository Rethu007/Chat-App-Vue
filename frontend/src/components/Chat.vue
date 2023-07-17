<template>
  <div class="flex items-center justify-center h-screen">
    <div class="bg-white rounded shadow-md p-4 w-full h-80">
      <!-- Chat messages will be displayed here -->
      <div
        ref="chatMessages"
        class="flex-1 bg-gray-100 p-4 overflow-y-auto"
        style="max-height: calc(100% - 50px)"
      >
        <div v-for="(message, index) in allMessages" :key="index" class="mb-2">
          <strong>{{ message.username }}:</strong> {{ message.message }}
        </div>
      </div>

      <!-- Input area for typing messages -->
      <div class="flex items-center bg-white p-2">
        <input
          type="text"
          v-model="message"
          @keyup.enter="sendMessage"
          class="flex-1 px-4 py-2 border rounded-l-lg"
          placeholder="Type your message..."
        />
        <button
          @click="sendMessage"
          class="px-4 py-2 bg-blue-500 text-white rounded-r-lg"
        >
          Send
        </button>
      </div>

      <!-- Display errors in an alert box -->
      <div v-if="error" class="text-red-500 mt-2">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  props: {
    username: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      message: "",
      messages: [], // Store all received messages from the server and user
      error: "", // Store error messages
    };
  },
  computed: {
    allMessages() {
      return this.messages.slice(-100);
    },
  },
  created() {
    this.setupSocketIO();
    this.fetchMessages();
  },
  methods: {
    setupSocketIO() {
      // Connect to the Socket.IO server for WebSocket communication
      this.socket = io("http://localhost", {
        path: "/socket-io", // This should match the path used in the backend
      }); // Update the URL to match your NGINX configuration
      // Receive new messages from the server
      this.socket.on("newMessage", (message) => {
        // Check if the incoming message is from the current user
        if (message.username !== this.username) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      });
    },
    /**
     * Fetches the last 100 messages from the backend API and updates the component's messages data.
     *
     * @return {Promise<void>} A promise that resolves once the messages have been fetched and the component's data has been updated.
     */
    async fetchMessages() {
      try {
        // Fetch the last 100 messages from the backend API
        const response = await fetch("http://localhost/api/messages"); // Update the URL to match your NGINX configuration
        const messages = await response.json();
        this.messages = messages;
        this.$nextTick(this.scrollToBottom);
      } catch (error) {
        this.showError("Failed to fetch messages.");
        console.error("Failed to fetch messages:", error);
      }
    },
    /**
     * Sends the message to the server via HTTP POST request and updates the messages list.
     *
     * @param {type} paramName - description of parameter
     * @return {type} description of return value
     */
    sendMessage() {
      if (this.message.trim() !== "") {
        const newMessage = {
          username: this.username,
          message: this.message.trim(),
        };

        // Send the message to the server via HTTP POST request
        fetch("http://localhost/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        })
          .then((response) => response.json())
          .then((data) => {
            this.messages.push(data);
            this.scrollToBottom();
          })
          .catch((error) => {
            this.showError("Failed to send message.");
            console.error("Failed to send message:", error);
          });

        // Clear the input after sending the message
        this.message = "";
      }
    },
    /**
     * Scrolls the chat messages to the bottom.
     *
     * @param {none} none - This function does not take any parameters.
     * @return {none} This function does not return anything.
     */
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    /**
     * Sets the error message and clears it after 5 seconds.
     *
     * @param {string} message - The error message to be displayed.
     * @return {void}
     */
    showError(message) {
      this.error = message;
      setTimeout(() => {
        this.error = "";
      }, 5000);
    },
  },
  beforeDestroy() {
    // Close the Socket.IO connection when the component is destroyed
    this.socket.disconnect();
  },
};
</script>
