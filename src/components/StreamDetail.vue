<template>
  <div class="stream-detail">
    <header class="header">
      <h2 v-if="stream">{{ stream.title }}</h2>
      <nav class="menu">
        <router-link to="/dashboard" class="menu-item">Dashboard</router-link>
      </nav>
    </header>
    <div class="content" v-if="stream">
      <div class="main-content">
        <div class="video-placeholder">Video Placeholder</div>
        <div class="side-section">
          <div class="comments-section">
            <h3>Latest Comments</h3>
            <div class="comments-list scrollable">
              <div v-if="comments.length">
                <div
                  v-for="comment in visibleComments"
                  :key="comment.id"
                  class="comment"
                >
                  <p class="comment-content">
                    {{ comment.content }} -
                    <span class="small-text">{{
                      formatDate(comment.created_at)
                    }}</span>
                  </p>
                </div>
                <button
                  v-if="hasMoreComments"
                  @click="loadMoreComments"
                  class="btn-load-more"
                >
                  Load More Comments
                </button>
              </div>
              <div v-else>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            </div>
            <form @submit.prevent="submitComment" class="comment-form">
              <h3>Leave a Comment</h3>
              <textarea
                v-model="commentContent"
                placeholder="Write your comment"
              ></textarea>
              <button type="submit" class="btn">Submit Comment</button>
            </form>
          </div>
        </div>
      </div>
      <div class="donations-section">
        <h3>Latest Donations</h3>
        <div v-if="donations.length">
          <div class="donations-list scrollable">
            <div
              v-for="donation in visibleDonations"
              :key="donation.id"
              class="donation"
            >
              <p class="donation-content">
                {{ donation.message }} - Rp
                {{ formatCurrency(donation.amount) }}
                <span class="small-text">{{
                  formatDate(donation.created_at)
                }}</span>
              </p>
            </div>
          </div>
          <button
            v-if="hasMoreDonations"
            @click="loadMoreDonations"
            class="btn-load-more"
          >
            Load More Donations
          </button>
        </div>
        <div v-else>
          <p>No donations yet.</p>
        </div>
      </div>
      <p>{{ stream.description }}</p>
      <div class="forms">
        <form
          v-if="!showPaymentGateway"
          @submit.prevent="proceedToPaymentGateway"
        >
          <h3>Make a Donation</h3>
          <input
            type="number"
            v-model="donationAmount"
            placeholder="Amount"
            required
          />
          <input type="text" v-model="donationMessage" placeholder="Message" />
          <button type="submit" class="btn">Proceed to Payment</button>
        </form>
        <div v-else class="payment-gateway">
          <h3>Choose Payment Method</h3>
          <select v-model="paymentMethod" required>
            <option disabled value="">Select a payment method</option>
            <option value="credit_card">Credit Card</option>
            <option value="paypal">Virtual Account</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          <button @click="submitDonation" class="btn">Submit Donation</button>
        </div>
        <p v-if="donationError" class="error-message">{{ donationError }}</p>
      </div>
    </div>
    <div v-else class="loading">Loading stream details...</div>
    <footer>
      <div class="footer-content">
        © 2024 Django Live Streaming By Dwi Didit Prasetiyo. All rights
        reserved.
        <br />
        1234 Main Street, Suite 100, Jakarta, Indonesia
      </div>
    </footer>
    <div
      v-if="notification.message"
      class="notification"
      :class="notification.type"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { format } from "date-fns";

interface Stream {
  id: number;
  title: string;
  description: string;
  streamer: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
}

interface Donation {
  id: number;
  amount: string;
  message: string;
  created_at: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

export default defineComponent({
  setup() {
    const route = useRoute();
    const stream = ref<Stream | null>(null);
    const comments = ref<Comment[]>([]);
    const donations = ref<Donation[]>([]);
    const commentContent = ref("");
    const donationAmount = ref<number | null>(null);
    const donationMessage = ref("");
    const paymentMethod = ref("");
    const visibleCommentsCount = ref(2);
    const visibleDonationsCount = ref(2);
    const donationError = ref("");
    const showPaymentGateway = ref(false);
    const notification = ref({ message: "", type: "" });

    const visibleComments = computed(() =>
      comments.value.slice(0, visibleCommentsCount.value)
    );
    const hasMoreComments = computed(
      () => comments.value.length > visibleCommentsCount.value
    );

    const visibleDonations = computed(() =>
      donations.value.slice(0, visibleDonationsCount.value)
    );
    const hasMoreDonations = computed(
      () => donations.value.length > visibleDonationsCount.value
    );

    const fetchStream = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/streams/${route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.code === 200) {
          stream.value = response.data.data;
          fetchComments();
          fetchDonations();
          connectWebSocket(route.params.id.toString());
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching stream:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/comments/${route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.code === 200) {
          comments.value = response.data.data;
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchDonations = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/donations/?stream=${route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.code === 200) {
          donations.value = response.data.data;
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
      }
    };

    const proceedToPaymentGateway = () => {
      showPaymentGateway.value = true;
    };

    const submitComment = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          `/comments/create/`,
          {
            content: commentContent.value,
            stream: route.params.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.code === 201) {
          comments.value.unshift(response.data.data[0]);
          commentContent.value = "";
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    };

    const submitDonation = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          `/donations/create/`,
          {
            amount: donationAmount.value,
            message: donationMessage.value,
            stream: route.params.id,
            payment_method: paymentMethod.value,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.code === 201) {
          donations.value.unshift(response.data.data);
          donationAmount.value = null;
          donationMessage.value = "";
          donationError.value = "";
          showPaymentGateway.value = false;
        } else {
          console.error(response.data.message);
          if (
            response.data.message === "You cannot donate to your own streams."
          ) {
            donationError.value = response.data.message;
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data.message;
          console.error("Error response data:", errorMessage);
          donationError.value = errorMessage;
        } else {
          console.error("Error submitting donation:", error);
          donationError.value = "An unexpected error occurred.";
        }
      }
    };

    const loadMoreComments = () => {
      visibleCommentsCount.value += 2;
    };

    const loadMoreDonations = () => {
      visibleDonationsCount.value += 2;
    };

    const connectWebSocket = (streamId: string) => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const wsUrl = `${process.env.VUE_APP_WEBSOCKET_URL}${streamId}/`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connection established");

        // Send the token for authentication
        socket.send(JSON.stringify({ type: "authenticate", token }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "authentication_success") {
          console.log("WebSocket authentication successful");
        } else if (data.type === "authentication_failure") {
          console.error("WebSocket authentication failed");
          socket.close();
        } else if (data.message) {
          if (data.message.startsWith("New comment:")) {
            comments.value.unshift({
              id: Date.now(),
              content: data.message.replace("New comment: ", ""),
              created_at: new Date().toISOString(),
            });
          } else if (data.message.startsWith("New donation:")) {
            const messageParts = data.message.split(", Message: ");
            donations.value.unshift({
              id: Date.now(),
              amount: messageParts[0]
                .replace("New donation: Rp ", "")
                .replace(/\.\d+/, ""),
              message: messageParts[1] || "Donation",
              created_at: new Date().toISOString(),
            });
          }
          showNotification(data.message, "success");
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed", event);
      };
    };

    const showNotification = (message: string, type: string) => {
      notification.value = { message, type };
      setTimeout(() => {
        notification.value = { message: "", type: "" };
      }, 3000);
    };

    const formatDate = (dateString: string) => {
      return format(new Date(dateString), "MMMM dd, yyyy, hh:mm a");
    };

    const formatCurrency = (amount: string) => {
      return parseFloat(amount)
        .toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace("Rp", "")
        .trim();
    };

    onMounted(() => {
      fetchStream();
    });

    return {
      stream,
      comments,
      donations,
      commentContent,
      donationAmount,
      donationMessage,
      paymentMethod,
      submitComment,
      submitDonation,
      visibleComments,
      hasMoreComments,
      loadMoreComments,
      formatDate,
      visibleDonations,
      hasMoreDonations,
      loadMoreDonations,
      formatCurrency,
      donationError,
      showPaymentGateway,
      proceedToPaymentGateway,
      notification,
    };
  },
});
</script>

<style scoped>
.stream-detail {
  padding: 1rem;
  background-color: #f9f9f9;
  color: #333;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.header h2 {
  font-size: 24px;
  color: #9146ff;
  margin: 0;
}

.menu {
  display: flex;
  gap: 1rem;
}

.menu-item {
  color: #333;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.content {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.main-content {
  display: flex;
  gap: 1rem;
}

.video-placeholder {
  width: 70%;
  height: 450px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.side-section {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comments-list,
.donations-list {
  max-height: 300px;
  overflow-y: auto;
}

.donation {
  background: #fff;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 0.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comment {
  background: #fff;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 0.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comment-content,
.donation-content {
  margin: 0;
}

.comment .small-text,
.donation .small-text {
  font-size: 0.8rem;
  color: #666;
}

.comment-form {
  margin-top: 1rem;
}

.forms {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  height: 100px;
}

input[type="number"],
input[type="text"],
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  background-color: #9146ff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
}

.btn:hover {
  background-color: #772ce8;
}

.btn-load-more {
  background-color: #9146ff;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
}

.btn-load-more:hover {
  background-color: #772ce8;
}

.error-message {
  color: red;
  margin-top: 1rem;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  z-index: 1000;
}

.notification.success {
  background-color: #4caf50;
}

.notification.error {
  background-color: #f44336;
}

footer {
  background-color: #9146ff;
  color: white;
  padding: 1rem;
  text-align: center;
  position: relative;
  bottom: 0;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
