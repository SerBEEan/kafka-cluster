const { Kafka, Partitioners } = require('kafkajs');
const { prepareArgs } = require('./utils');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092'],
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const args = prepareArgs(process.argv);

if (typeof args.send === 'string') {
  send({ type: args.send }, 'messages');
}


async function send(message, topicName) {
  try {
    await producer.connect();
    await producer.send({
      topic: topicName,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    await producer.disconnect();
  } catch(e) {
    console.error(e);
  }
}
