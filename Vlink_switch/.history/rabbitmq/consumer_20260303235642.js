const amqp = require("amqplib");

const sendToQueue = async (queue, data) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });

  setTimeout(() => {
    channel.close();
    connection.close();
  }, 500);
};

module.exports = { sendToQueue };
