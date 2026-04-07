const amqp = require("amqplib");
require("dotenv").config();

const MAX_RETRY = 3;

const startVlink = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue("vlink_request_queue", { durable: true });
  await channel.assertQueue("bank2_process_queue", { durable: true });
  await channel.assertQueue("bank1_rollback_queue", { durable: true });
  await channel.assertQueue("vlink_response_queue", { durable: true });

  console.log("🚦 VLINK_SWITCH đang chạy...");

  channel.consume("vlink_request_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    channel.sendToQueue(
      "bank2_process_queue",
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );

    channel.ack(msg);
  });

  channel.consume("vlink_response_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    if (data.status === "success") {
      console.log("✅ Thành công");
    } else {
      if (data.retry < MAX_RETRY) {
        data.retry += 1;

        channel.sendToQueue(
          "bank2_process_queue",
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
      } else {
        channel.sendToQueue(
          "bank1_rollback_queue",
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
      }
    }

    channel.ack(msg);
  });
};

module.exports = { startVlink };
