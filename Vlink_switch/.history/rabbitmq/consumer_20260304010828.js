const amqp = require("amqplib");

async function startVlinkConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("vlink_queue");
  await channel.assertQueue("banking_process_queue");
  await channel.assertQueue("dac_response_queue");

  console.log("🚀 VLINK đang lắng nghe vlink_queue...");

  channel.consume("vlink_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📥 VLINK nhận:", data);

    // Forward sang BANKING_APP
    channel.sendToQueue(
      "banking_process_queue",
      Buffer.from(JSON.stringify(data)),
    );

    console.log("🔀 VLINK forward sang BANKING_APP");

    channel.ack(msg);
  });

  // Nhận response từ BANKING_APP và trả về DAC
  channel.consume("dac_response_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📤 VLINK gửi response về DAC:", data);

    channel.sendToQueue(
      "dac_response_queue",
      Buffer.from(JSON.stringify(data)),
    );

    channel.ack(msg);
  });
}

module.exports = { startVlinkConsumer };
