const amqp = require("amqplib");

async function startVlink() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("vlink_queue", { durable: true });
  await channel.assertQueue("banking_process_queue", { durable: true });

  console.log("🚀 VLINK đang lắng nghe vlink_queue...");

  channel.consume("vlink_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📥 VLINK nhận:", data);

    // 🔎 XỬ LÝ CHECK ACCOUNT
    // if (data.type === "CHECK_ACCOUNT") {
    //   await channel.sendToQueue(
    //     "banking_process_queue",
    //     Buffer.from(JSON.stringify(data)),
    //     { persistent: true },
    //   );

    //   console.log("🔀 VLINK forward CHECK_ACCOUNT sang BANKING_APP");
    // }
    //test
    if (data.type === "CHECK_ACCOUNT") {
  const targetQueue =
    data.fromBank === "DAC_BANK"
      ? "banking_process_queue"
      : "dac_process_queue";

  await channel.sendToQueue(
    targetQueue,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );

  console.log("🔀 VLINK forward CHECK_ACCOUNT:", targetQueue);
}

    // 💸 XỬ LÝ TRANSFER
    // if (data.type === "TRANSFER") {
    //   await channel.sendToQueue(
    //     "banking_process_queue",
    //     Buffer.from(JSON.stringify(data)),
    //     { persistent: true },
    //   );

    //   console.log("🔀 VLINK forward TRANSFER sang BANKING_APP");
    // }
    
    
//     channel.ack(msg);
//   });
// }
// Test
if (data.type === "TRANSFER") {
  const targetQueue =
    data.fromBank === "DAC_BANK"
      ? "banking_process_queue"
      : "dac_process_queue";

  await channel.sendToQueue(
    targetQueue,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );

  console.log("🔀 VLINK forward TRANSFER:", targetQueue);
}
module.exports = { startVlink };
