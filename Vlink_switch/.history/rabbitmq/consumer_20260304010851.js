const amqp = require("amqplib");

async function startVlink() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("vlink_queue");

  channel.consume("vlink_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    // Nếu là CHECK_ACCOUNT
    if (data.type === "CHECK_ACCOUNT") {
      // forward sang ngân hàng còn lại
      await channel.sendToQueue(
        "banking_process_queue",
        Buffer.from(JSON.stringify(data)),
      );
    }

    channel.ack(msg);
  });
}

module.exports = { startVlink };
