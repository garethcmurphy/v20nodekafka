"use strict";

const shortid = require('shortid');
var kafka = require("kafka-node");
var fs = require("fs");
var rp = require("request-promise");
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.KafkaClient;
var argv = require("optimist").argv;

function readjson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

var config = readjson("config.json");
var v20ip = "172.24.0.207";
var dmscip = config.kafkaIP;
var v20topic = "the_status_topic";
var url = config.url;
var dmsctopic = config.topic
var topic = argv.topic || dmsctopic;
var client = new Client({ kafkaHost: dmscip + ":9092" });
var topics = [{ topic: topic, partition: 0 }];
var options = {
  autoCommit: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024
};

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

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
    var dataset = await postToSciCat(x, message, config, sampleId);
    var z = await sampleToSciCat(x, message, config, sampleId);
    var q = await origToSciCat(x,dataset, message, config, sampleId);
  }

consumer.on("message", function(message) {
  sendtoscicat(message , config);
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


async function loginToScicat( config) {
  console.log("login to scicat");
  let url = "http://"+config.scicatIP+"/api/v3/Users/login";
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
    console.log(options1);
    const response = await rp(options1);
    console.log(response);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}


async function postToSciCat(token, message, config, sampleId) {
  console.log("posting to scicat");
  let url = "http://"+config.scicatIP+"/api/v3/RawDatasets/"+"?access_token="+token.id;
  console.log(url);
  let fileName = "default.nxs";
  var scimet = message.value.replace(/\n/g, '');
  var jsonFormattedString = scimet.replace(/\\\//g, "/");
  var scimetObject = JSON.parse(jsonFormattedString);
  var defaultDataset = readjson("dataset.json");
  let dataset = {
    "principalInvestigator": defaultDataset.principalInvestigator,
    "endTime": new Date(Date.now()),
    "creationLocation": defaultDataset.creationLocation,
    "dataFormat": defaultDataset.dataFormat,
    "scientificMetadata": scimetObject,
    "owner":  defaultDataset.owner,
    "ownerEmail": defaultDataset.ownerEmail,
    "orcidOfOwner":  defaultDataset.orcidOfOwner,
    "contactEmail":  defaultDataset.contactEmail,
    "sourceFolder":  defaultDataset.sourceFolder,
    "size": 0,
    "packedSize": 0,
    "creationTime": new Date(Date.now()),
    "type": "string",
    "validationStatus": "string",
    "keywords": defaultDataset.keywords,
    "description":   defaultDataset.description,
    "datasetName":  defaultDataset.datasetName,
    "classification":  defaultDataset.classification,
    "license":  defaultDataset.license,
    "version":  defaultDataset.version,
    "isPublished":  defaultDataset.isPublished,
    "ownerGroup":  defaultDataset.ownerGroup,
    "accessGroups": defaultDataset.accessGroups,
    "createdBy": "string",
    "updatedBy": "string",
    "createdAt": "2019-03-20T12:39:37.646Z",
    "updatedAt": "2019-03-20T12:39:37.646Z",
    "sampleId": sampleId,
    "proposalId": defaultDataset.proposalId,
    "datasetlifecycle": {
      "archivable": true,
      "retrievable": true,
      "publishable": true,
      "dateOfDiskPurging": "2019-03-20T12:39:37.646Z",
      "archiveRetentionTime": "2019-03-20T12:39:37.646Z",
      "dateOfPublishing": "2019-03-20T12:39:37.646Z",
      "isOnCentralDisk": true,
      "archiveStatusMessage": "string",
      "retrieveStatusMessage": "string",
      "archiveReturnMessage": {},
      "retrieveReturnMessage": {},
      "exportedTo": "string",
      "retrieveIntegrityCheck": true
    },
    "history": [
      {
        "id": "string"
      }
    ]
  }

  
  console.log(dataset);
  let options1 = {
    url: url,
    method: "POST",
    body: dataset,
    json: true,
    rejectUnauthorized: false
  };
  try {
    console.log(options1);
    const response = await rp(options1);
    console.log(response);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}


async function sampleToSciCat(token, message, config, sampleId) {
  console.log("sample to scicat");
  let url = "http://"+config.scicatIP+"/api/v3/Samples/"+"?access_token="+token.id;
  console.log(url);
  var defaultDataset = readjson("sample.json");
  let dataset = {
    "samplelId": sampleId,
    "owner": defaultDataset.owner,
    "description": defaultDataset.description,
    "createdAt": "2019-03-21T13:22:42.132Z",
    "sampleCharacteristics": {},
    "attachments": [
      "string"
    ],
    "ownerGroup": defaultDataset.ownerGroup,
    "accessGroups": defaultDataset.accessGroups
  }
  console.log(dataset);
  let options1 = {
    url: url,
    method: "POST",
    body: dataset,
    json: true,
    rejectUnauthorized: false
  };
  try {
    console.log(options1);
    const response = await rp(options1);
    console.log(response);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}


  async function origToSciCat(token, dataset, message, config, sampleId) {
    console.log("orig to scicat");
    let url = "http://"+config.scicatIP+"/api/v3/OrigDatablocks/"+"?access_token="+token.id;
    console.log(url);
    var defaultDataset = readjson("orig.json");
  if (message.hasOwnProperty("file_attributes")) {
    if (message.file_attributes.hasOwnProperty("file_name")) {
      fileName = message.file_attributes.file_name;
    }
  }
    let orig = {
      "size": 0,
      "dataFileList": [
        {
          "path": fileName,
          "size": 0,
          "time": new Date(Date.now()),
          "chk": "34782",
          "uid": "101",
          "gid": "101",
          "perm": "755"
        }
      ],
      "ownerGroup": defaultDataset.ownerGroup,
      "accessGroups": defaultDataset.accessGroups,
      "createdBy": "string",
      "updatedBy": "string",
      "datasetId": dataset.pid,
      "rawDatasetId": "string",
      "derivedDatasetId": "string",
      "createdAt": "2019-04-03T08:25:27.122Z",
      "updatedAt": "2019-04-03T08:25:27.122Z"
    }
  
  console.log(orig);
  let options1 = {
    url: url,
    method: "POST",
    body: orig,
    json: true,
    rejectUnauthorized: false
  };
  try {
    console.log(options1);
    const response = await rp(options1);
    console.log(response);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}
