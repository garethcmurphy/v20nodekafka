'use strict';

var kafka = require('kafka-node');
var require = require('request');
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.KafkaClient;
var argv = require('optimist').argv;
var v20topic = 'the_status_topic';
var dmsctopic = 'scicat';
var topic = argv.topic || v20topic;

var v20ip = '172.24.0.207'; 
var dmscip = '172.17.5.38'; 
var client = new Client({ kafkaHost: v20ip+':9092' });
var topics = [{ topic: topic, partition: 0 }];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

    // Refresh metadata required for the first message to go through
    // https://github.com/SOHU-Co/kafka-node/pull/378
    client.refreshMetadata([topic], (err) => {
        if (err) {
            console.warn('Error refreshing kafka metadata', err);
        }
    });

consumer.on('message', function (message) {
  console.log(message);
});

consumer.on('error', function (err) {
  console.log('error', err);
});

/*
* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
*/
consumer.on('offsetOutOfRange', function (topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});

