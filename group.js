var async = require('async');
var kafka = require("kafka-node");
var ConsumerGroup = kafka.ConsumerGroup;

var consumerOptions = {
    kafkaHost: '127.0.0.1:9093',
    fetchMaxBytes: 16 * 1024 * 1024,
    groupId: 'ExampleTestGroup',
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    fromOffset: 'latest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
};

var topics = ['V20_writerCommand'];

var consumerGroup = new ConsumerGroup(Object.assign({ id: 'consumer1' }, consumerOptions), topics);
consumerGroup.on('error', onError);
consumerGroup.on('message', onMessage);


function onError(error) {
    console.error(error);
    console.error(error.stack);
}

function onMessage(message) {
    console.log(
        '%s read msg Topic="%s" Partition=%s Offset=%d',
        this.client.clientId,
        message.topic,
        message.partition,
        message.offset
    );
}

process.once('SIGINT', function () {
    async.each([consumerGroup  ], function (consumer, callback) {
        consumer.close(true, callback);
    });
});