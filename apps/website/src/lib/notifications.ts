import "server-only";

export type OrderNotificationDetails = {
  number: string;
  email: string;
  fullName: string;
  phone?: string | null;
  totalCents: number;
  paymentMethod: string;
};

export function simulateOrderConfirmationNotification(order: OrderNotificationDetails) {
  const amount = (order.totalCents / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const emailBody = `
=========================================
[EMAIL SIMULATION] TO: ${order.email}
Subject: Order Confirmed — ${order.number} | JR INTERIORS

Dear ${order.fullName},

Thank you for your order! Your payment via ${
    order.paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"
  } is confirmed.

Order Number: ${order.number}
Total: ${amount}

Our team is preparing your custom furniture pieces. We will contact you at ${
    order.phone || "your email"
  } to coordinate the White-Glove delivery (7–14 days).

Warm regards,
JR Interiors Concierge
=========================================
  `;

  console.log(emailBody);

  if (order.phone) {
    const smsBody = `
=========================================
[SMS SIMULATION] TO: ${order.phone}
JR-INTERIORS: Hi ${order.fullName}, your order ${order.number} is confirmed! Amount: ${amount}. Track details here: http://localhost:3000/account
=========================================
    `;
    console.log(smsBody);
  }
}

export function simulateFulfillmentNotification(order: OrderNotificationDetails, itemName: string) {
  const emailBody = `
=========================================
[EMAIL SIMULATION] TO: ${order.email}
Subject: Shipment Update — Order ${order.number} | JR INTERIORS

Dear ${order.fullName},

Exciting news! Your item "${itemName}" from order ${order.number} has been crafted and marked as FULFILLED by the seller.

It is now being prepared for shipping and concierge delivery. You can track your shipment status on your dashboard: http://localhost:3000/account.

Warm regards,
JR Interiors Concierge
=========================================
  `;

  console.log(emailBody);

  if (order.phone) {
    const smsBody = `
=========================================
[SMS SIMULATION] TO: ${order.phone}
JR-INTERIORS: Good news ${order.fullName}! Your item "${itemName}" from order ${order.number} has been fulfilled. Track: http://localhost:3000/account
=========================================
    `;
    console.log(smsBody);
  }
}
