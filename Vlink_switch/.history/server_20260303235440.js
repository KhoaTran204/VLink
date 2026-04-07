require("dotenv").config();
const express = require("express");
const { startConsumer } = require("./rabbitmq/consumer");

const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("🚀 VLINK_SWITCH đang chạy tại cổng", process.env.PORT);
  startConsumer();
});
