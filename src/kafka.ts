"use strict";

import {  SciCat } from "./postToSciCat";


const shortid = require("shortid");
var kafka = require("kafka-node");
var fs = require("fs");
var rp = require("request-promise");
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.KafkaClient;
var argv = require("optimist").argv;

export function readjson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

var config = readjson("config.json");
var v20ip = "172.24.0.207";
var dmscip = config.kafkaIP;
var v20topic = "the_status_topic";
var url = config.url;
var dmsctopic = config.topic;
var topic = argv.topic || dmsctopic;
var client = new Client({ kafkaHost: dmscip  });
var topics = [{ topic: topic, partition: 0 }];
var options = {
  //autoCommit: false,
  apiVersionRequest: true,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 64 * 1024 * 1024,
  fromOffset: true,
  encoding: "utf8"
};

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);
offset.fetchLatestOffsets([topic], (err, offsets) => {
  if (err) {
    console.log(`error fetching latest offsets ${err}`);
    return;
  }
  var latest = 1;
  Object.keys(offsets[topic]).forEach(o => {
    latest = offsets[topic][o] > latest ? offsets[topic][o] : latest;
    console.log("latest offset", latest);
  });
   consumer.setOffset(topic, 0, latest - 1);
});

// Refresh metadata required for the first message to go through
// https://github.com/SOHU-Co/kafka-node/pull/378
client.refreshMetadata([topic], err => {
  if (err) {
    console.warn("Error refreshing kafka metadata", err);
  }
});

async function sendtoscicat(message, config) {
  var x = await loginToScicat(config);
  let sampleId = shortid.generate();
  let sci= new SciCat()
  var dataset = await sci.postToSciCat(x, message, config, sampleId);
  var z = await sci.sampleToSciCat(x, dataset, config, sampleId);
  var q = await sci.origToSciCat(x, dataset, message, config, sampleId);
}

consumer.on("message", function(message) {
  // check is message is stop or start
  // unpack message
  // if stop then find file and scp/copy if start post to scicat
  var scimet = message.value.replace(/\n/g, "");
  console.log("offset", message.offset);
  var jsonFormattedString = scimet.replace(/\\\//g, "/");
  console.log("message", jsonFormattedString.slice(0,50));
  if (jsonFormattedString.endsWith("}") && jsonFormattedString.startsWith("{") ) {
    var scimetObject = JSON.parse(jsonFormattedString);
    if (scimetObject.hasOwnProperty("cmd")) {
      const cmd = scimetObject["cmd"];
      console.log("cmd", cmd);
      if (cmd === "FileWriter_new") {
        console.log("start send");
        sendtoscicat(message, config);
      } else if (cmd === "FileWriter_stop") {
        console.log("add copy logic");
      } else {
        console.log(cmd);
      }
    }
  }

  //console.log(message);
});

consumer.on("error", function(err) {
  console.log("error", err);
});

/*
 * If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
 */
consumer.on("offsetOutOfRange", function(topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function(err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});

async function loginToScicat(config) {
  console.log("login to scicat");
  let url =  config.scicatIP + "/api/v3/Users/login";
  let rawdata = readjson("user.json");
  console.log(rawdata);
  let options1 = {
    url: url,
    method: "POST",
    body: rawdata,
    json: true,
    rejectUnauthorized: false
  };
  try {
    //console.log(options1);
    const response = await rp(options1);
    //console.log(response);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}
