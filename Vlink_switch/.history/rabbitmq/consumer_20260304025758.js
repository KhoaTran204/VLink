const amqp = require("amqplib");

async function startVlink() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("vlink_queue");
  await channel.assertQueue("banking_process_queue");

  console.log("🚀 VLINK đang lắng nghe vlink_queue...");

  channel.consume("vlink_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📥 VLINK nhận:", data);

    if (data.type === "CHECK_ACCOUNT") {
      await channel.sendToQueue(
        "banking_process_queue",
        Buffer.from(JSON.stringify(data)),
      );

      console.log("🔀 VLINK forward sang BANKING_APP");
    }

    channel.ack(msg);
  });
}

module.exports = { startVlink };
