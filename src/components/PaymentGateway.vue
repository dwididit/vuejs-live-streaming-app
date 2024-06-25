<template>
  <div class="payment-gateway">
    <h2>Midtrans Payment Gateway</h2>
    <p>Transaction ID: {{ transactionId }}</p>
    <button @click="processPayment" class="btn">Complete Payment</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "PaymentGateway",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const transactionId = ref(route.query.transaction_id);

    const processPayment = () => {
      // Simulate a successful payment process
      alert("Payment successful!");
      router.push("/dashboard");
    };

    return {
      transactionId,
      processPayment,
    };
  },
});
</script>

<style scoped>
.payment-gateway {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
}

h2 {
  color: #9146ff;
  margin-bottom: 1rem;
}

p {
  font-size: 18px;
  margin-bottom: 2rem;
}

.btn {
  background-color: #9146ff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #772ce8;
}
</style>
