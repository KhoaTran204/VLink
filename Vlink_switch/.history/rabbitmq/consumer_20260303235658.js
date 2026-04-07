const amqp = require("amqplib");
const { sendToQueue } = require("./producer");
const { shouldRetry } = require("../services/retry.service");

const startConsumer = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(process.env.QUEUE_FROM_BANK1, { durable: true });

  console.log("🔄 VLINK_SWITCH đang chờ yêu cầu từ Bank1...");

  channel.consume(process.env.QUEUE_FROM_BANK1, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    console.log("📥 Nhận giao dịch:", data);

    try {
      await sendToQueue(process.env.QUEUE_TO_BANK2, {
        ...data,
        retryCount: data.retryCount || 0,
      });

      console.log("📤 Đã chuyển sang Bank2");
    } catch (err) {
      console.log("❌ Lỗi gửi sang Bank2");

      if (shouldRetry(data.retryCount || 0)) {
        data.retryCount = (data.retryCount || 0) + 1;

        console.log(`🔁 Retry lần ${data.retryCount}`);

        await sendToQueue(process.env.QUEUE_FROM_BANK1, data);
      } else {
        console.log("💸 Thất bại 3 lần → Hoàn tiền");

        await sendToQueue(process.env.QUEUE_REFUND, data);
      }
    }

    channel.ack(msg);
  });
};

module.exports = { startConsumer };
