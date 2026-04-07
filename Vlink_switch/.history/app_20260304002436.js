require("dotenv").config();
const { startVlink } = require("./rabbitmq/consumer");

startVlink();
