const amqp = require("amqplib");
require("dotenv").config();

async function startVlink() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(process.env.VLINK_QUEUE);
  await channel.assertQueue(process.env.BANKING_PROCESS_QUEUE);

  console.log("🚀 VLINK đang lắng nghe...");

  channel.consume(process.env.VLINK_QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📥 VLINK nhận:", data);

    // 🔥 FORWARD TẤT CẢ MESSAGE
    await channel.sendToQueue(
      process.env.BANKING_PROCESS_QUEUE,
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );

    console.log("🔀 VLINK forward sang BANKING_APP");

    channel.ack(msg);
  });
}

module.exports = { startVlink };
