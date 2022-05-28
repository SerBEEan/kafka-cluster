const { Kafka } = require('kafkajs')
const { prepareArgs } = require('./utils');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092'],
});
const admin = kafka.admin();

const args = prepareArgs(process.argv);

for (const key in args) {
    switch(key) {
        case '--create-topic':
            createTopics(args[key]);
            break;
        case '--get-list':
            getTopics();
            break;
        default:
            console.log(`Команды ${key} не существует`);
            break;
    }
}


async function getTopics() {
    await admin.connect();
    const list = await admin.listTopics();
    console.log(list);
    await admin.disconnect();
};

async function createTopics(topicName) {
    await admin.connect();

    await admin.createTopics({
        topics: [
            {
                topic: topicName,
                numPartitions: 2,       // default: -1 (uses broker `num.partitions` configuration)
                replicationFactor: 3,   // default: -1 (uses broker `default.replication.factor` configuration)
                replicaAssignment: [],  // Example: [{ partition: 0, replicas: [0,1,2] }] - default: []
                configEntries: []       // Example: [{ name: 'cleanup.policy', value: 'compact' }] - default: []
            },
        ],
    });

    await admin.disconnect();
};
