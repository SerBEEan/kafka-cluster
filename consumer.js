const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const start = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'messages', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());

        // For dead_letter
        // console.log(data);

        if (data.type === 'message') {
          console.log('\nDone!', data);
        } else {
          await producer.connect();

          await producer.send({
            topic: 'dead_letter',
            messages: [
              { value: JSON.stringify(data) },
            ],
          });

          await producer.disconnect();
          console.log('\nОтправил в error');
        }
      },
    })
};

start();
