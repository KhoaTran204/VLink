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
const amqp = require("amqplib");

async function startVlink() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // 🔥 TẠO ĐẦY ĐỦ QUEUE
  await channel.assertQueue("vlink_queue", { durable: true });
  await channel.assertQueue("banking_process_queue", { durable: true });
  await channel.assertQueue("dac_process_queue", { durable: true });

  console.log("🚀 VLINK đang lắng nghe vlink_queue...");

  channel.consume("vlink_queue", async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());

      console.log("📥 VLINK nhận:", data);

      let targetQueue = "";

      // ================= CHECK ACCOUNT =================
      if (data.type === "CHECK_ACCOUNT") {
        targetQueue =
          data.fromBank === "DAC_BANK"
            ? "banking_process_queue"
            : "dac_process_queue";

        await channel.sendToQueue(
          targetQueue,
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );

        console.log("🔀 Forward CHECK_ACCOUNT →", targetQueue);
      }

      // ================= TRANSFER =================
      else if (data.type === "TRANSFER") {
        targetQueue =
          data.fromBank === "DAC_BANK"
            ? "banking_process_queue"
            : "dac_process_queue";

        await channel.sendToQueue(
          targetQueue,
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );

        console.log("🔀 Forward TRANSFER →", targetQueue);
      } else {
        console.log("⚠️ Unknown type:", data.type);
      }

      // ✅ ACK BẮT BUỘC
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Lỗi VLINK:", err);
      channel.ack(msg); // tránh treo queue
    }
  });
}

module.exports = { startVlink };
