// const amqp = require("amqplib");

// async function startVlink() {
//   const connection = await amqp.connect("amqp://localhost");
//   const channel = await connection.createChannel();

//   await channel.assertQueue("vlink_queue", { durable: true });
//   await channel.assertQueue("banking_process_queue", { durable: true });

//   console.log("🚀 VLINK đang lắng nghe vlink_queue...");

//   channel.consume("vlink_queue", async (msg) => {
//     const data = JSON.parse(msg.content.toString());

//     console.log("📥 VLINK nhận:", data);

//     // 🔎 XỬ LÝ CHECK ACCOUNT
//     if (data.type === "CHECK_ACCOUNT") {
//       await channel.sendToQueue(
//         "banking_process_queue",
//         Buffer.from(JSON.stringify(data)),
//         { persistent: true },
//       );

//       console.log("🔀 VLINK forward CHECK_ACCOUNT sang BANKING_APP");
//     }

//     // 💸 XỬ LÝ TRANSFER
//     if (data.type === "TRANSFER") {
//       await channel.sendToQueue(
//         "banking_process_queue",
//         Buffer.from(JSON.stringify(data)),
//         { persistent: true },
//       );

//       console.log("🔀 VLINK forward TRANSFER sang BANKING_APP");
//     }

//     channel.ack(msg);
//   });
// }
// module.exports = { startVlink };

//test
// const amqp = require("amqplib");

// async function startVlink() {
//   const connection = await amqp.connect("amqp://localhost");
//   const channel = await connection.createChannel();

//   // ================= QUEUES =================
//   await channel.assertQueue("vlink_queue", { durable: true });

//   await channel.assertQueue("banking_process_queue", { durable: true });
//   await channel.assertQueue("dac_process_queue", { durable: true });

//   await channel.assertQueue("vlink_response_queue", { durable: true });
//   await channel.assertQueue("dac_response_queue", { durable: true });
//   await channel.assertQueue("banking_response_queue", { durable: true });

//   console.log("🚀 VLINK đang chạy...");

//   // ===================================================
//   // 🟢 1. HANDLE REQUEST (DAC ↔ BANKING)
//   // ===================================================
//   channel.consume("vlink_queue", async (msg) => {
//     try {
//       const data = JSON.parse(msg.content.toString());

//       console.log("📥 VLINK nhận REQUEST:", data);

//       let targetQueue = "";

//       if (data.type === "CHECK_ACCOUNT" || data.type === "TRANSFER") {
//         targetQueue =
//           data.fromBank === "DAC_BANK"
//             ? "banking_process_queue"
//             : "dac_process_queue";

//         await channel.sendToQueue(
//           targetQueue,
//           Buffer.from(JSON.stringify(data)),
//           { persistent: true },
//         );

//         console.log("🔀 Forward REQUEST →", targetQueue);
//       } else {
//         console.log("⚠️ Unknown REQUEST type:", data.type);
//       }

//       channel.ack(msg);
//     } catch (err) {
//       console.error("❌ Lỗi REQUEST:", err);
//       channel.ack(msg);
//     }
//   });

//   // ===================================================
//   // 🔵 2. HANDLE RESPONSE (BANKING → DAC)
//   // ===================================================
//   channel.consume("vlink_response_queue", async (msg) => {
//     try {
//       const data = JSON.parse(msg.content.toString());

//       console.log("📥 VLINK nhận RESPONSE:", data);

//       let targetQueue = "";

//       if (data.fromBank === "DAC_BANK") {
//         targetQueue = "dac_response_queue";
//       } else {
//         targetQueue = "banking_response_queue";
//       }

//       await channel.sendToQueue(
//         targetQueue,
//         Buffer.from(JSON.stringify(data)),
//         { persistent: true },
//       );

//       console.log("🔁 Forward RESPONSE →", targetQueue);

//       channel.ack(msg);
//     } catch (err) {
//       console.error("❌ Lỗi RESPONSE:", err);
//       channel.ack(msg);
//     }
//   });
// }

// module.exports = { startVlink };
