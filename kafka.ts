"use strict";
const { ReadFile } = require("./readfile");

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
var client = new Client({ kafkaHost: dmscip + ":9093" });
var topics = [{ topic: topic, partition: 0 }];
var options = {
  //autoCommit: false,
  apiVersionRequest: true,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 16 * 1024 * 1024,
  fromOffset: true,
  encoding: 'utf8'
};

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);
offset.fetchLatestOffsets([topic], (err, offsets) => {
  if (err) {
      console.log(`error fetching latest offsets ${err}`)
      return
  }
  var latest = 1
  Object.keys(offsets[topic]).forEach( o => {
    latest = offsets[topic][o] > latest ? offsets[topic][o] : latest;
    console.log("latest offset", latest);
  })
  consumer.setOffset(topic, 0, latest-1)
})

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
  //var z = await sampleToSciCat(x, dataset, config, sampleId);
  // var q = await origToSciCat(x, dataset, message, config, sampleId);
}

consumer.on("message", function (message) {
  sendtoscicat(message, config);
  //console.log(message);
});

consumer.on("error", function (err) {
  console.log("error", err);
});

/*
 * If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
 */
consumer.on("offsetOutOfRange", function (topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});


async function loginToScicat(config) {
  console.log("login to scicat");
  let url = "http://" + config.scicatIP + "/api/v3/Users/login";
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


async function postToSciCat(token, message, config, sampleId) {
  console.log("posting to scicat");
  let url = "http://" + config.scicatIP + "/api/v3/RawDatasets/" + "?access_token=" + token.id;
  console.log(url);
  var scimet = message.value.replace(/\n/g, '');
  console.log("offset",message.offset)
  var jsonFormattedString = scimet.replace(/\\\//g, "/");
  var defaultDataset = readjson("dataset.json");
  let title = defaultDataset.datasetName;
  let sample_description = "V20 sample";
  let chopper_rotation_speed_1 = { "u": "Hz", "v": "14" };
  let chopper_rotation_speed_2 = { "u": "Hz", "v": "14" };
  let dateNow =new Date(2018, 10, 1, 10, 33, 30, 0); 
  var scimetObject = JSON.parse(jsonFormattedString);
  const reader = new ReadFile();
  const newObject2=reader.parse(scimetObject);
  console.log(newObject2);
  if (scimetObject.hasOwnProperty('nexus_structure')) {
    if (scimetObject.nexus_structure.hasOwnProperty('children')) {
      let entry = scimetObject.nexus_structure.children.find(child => child.name === "entry");
      if (entry.hasOwnProperty('children')) {
        console.log(entry);

        const titleObject = entry.children.find(child => child.name === "title");
        if ( titleObject !== undefined) {
          if (titleObject.hasOwnProperty('values')) {
            console.log(titleObject);
            title = titleObject.values;
          }
        }
        const startObject = entry.children.find(child => child.name === "start_time");
        if ( startObject !== undefined) {
          if (startObject.hasOwnProperty('values')) {
            console.log(startObject);
            dateNow = startObject.values;
          }
        }

        const sampleObject = entry.children.find(child => child.name === "sample");
        if ( sampleObject !== undefined) {
          if (sampleObject.hasOwnProperty('values')) {
            console.log(sampleObject);
            if (sampleObject.hasOwnProperty('children')){ 
              const sample_child = sampleObject.children.find(child => child.name === "description");
              sample_description = sample_child.values;
            }
          }
        }

        const instrumentObject =entry.children.find(child => child.name === "instrument");
        if (instrumentObject.hasOwnProperty('children')) {
          let chop1 = instrumentObject.children[0];
          if (chop1.hasOwnProperty('children')) {
            const chop1_child = chop1.children.find(child => child.name == "speed");
            if (chop1_child) {
              chopper_rotation_speed_1.v = chop1_child.values;
            }
          }
        }
      }
      //delete scimetObject['nexus_structure']['children'][0]['children'][4]['children'][8];
    }
  }
  //console.log('message timestamp', message.timestamp)
  let fileName = "default.nxs"
  if (scimetObject.hasOwnProperty('file_attributes')) {
    fileName = scimetObject.file_attributes.file_name;
  }
  let newObject = {
    start_time: dateNow,
    file_name: fileName,
    chopper_rotation_speed_1: chopper_rotation_speed_1,
    chopper_rotation_speed_2: chopper_rotation_speed_2,
    sample_description: sample_description
  };
  //dateNow = message.timestamp;
  let dataset = {
    "principalInvestigator": defaultDataset.principalInvestigator,
    "endTime": dateNow,
    "creationLocation": defaultDataset.creationLocation,
    "dataFormat": defaultDataset.dataFormat,
    "scientificMetadata": newObject,
    "owner": defaultDataset.owner,
    "ownerEmail": defaultDataset.ownerEmail,
    "orcidOfOwner": defaultDataset.orcidOfOwner,
    "contactEmail": defaultDataset.contactEmail,
    "sourceFolder": defaultDataset.sourceFolder,
    "size": 0,
    "packedSize": 0,
    "creationTime": dateNow,
    "type": "string",
    "validationStatus": "string",
    "keywords": defaultDataset.keywords,
    "description": defaultDataset.description,
    "datasetName": title,
    "classification": defaultDataset.classification,
    "license": defaultDataset.license,
    "version": defaultDataset.version,
    "isPublished": defaultDataset.isPublished,
    "ownerGroup": defaultDataset.ownerGroup,
    "accessGroups": defaultDataset.accessGroups,
    "createdBy": "string",
    "updatedBy": "string",
    "createdAt": dateNow,
    "updatedAt": dateNow,
    "sampleId": sampleId,
    "proposalId": defaultDataset.proposalId,
    "datasetlifecycle": {
      "archivable": true,
      "retrievable": true,
      "publishable": true,
      "dateOfDiskPurging": dateNow,
      "archiveRetentionTime": dateNow,
      "dateOfPublishing": dateNow,
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
  if (scimetObject.hasOwnProperty('cmd')) {
    if (scimetObject['cmd'] === 'FileWriter_stop') {
      return;
    }
  }


  console.log(dataset.scientificMetadata);
  let options1 = {
    url: url,
    method: "POST",
    body: dataset,
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



async function sampleToSciCat(token, data, config, sampleId) {
  console.log("sample to scicat");
  let url = "http://" + config.scicatIP + "/api/v3/Samples/" + "?access_token=" + token.id;
  console.log(url);
  let dateNow = new Date(Date.now());
  var defaultDataset = readjson("sample.json");
  let sample_description = defaultDataset.description;
  if (typeof data !== undefined) {
    if (data.scientificMetadata.hasOwnProperty('nexus_structure')) {
      sample_description = data.scientificMetadata['nexus_structure']['children'][0]['children'][5]['children'][0]['values'];
    }
  }
  let sample = {
    "samplelId": sampleId,
    "owner": defaultDataset.owner,
    "description": sample_description,
    "createdAt": dateNow,
    "sampleCharacteristics": {
      "description": sample_description
    },
    "attachments": [
      "string"
    ],
    "ownerGroup": defaultDataset.ownerGroup,
    "accessGroups": defaultDataset.accessGroups
  }
  console.log(sample);
  let options1 = {
    url: url,
    method: "POST",
    body: sample,
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


async function origToSciCat(token, dataset, message, config, sampleId) {
  console.log("orig to scicat");
  let url = "http://" + config.scicatIP + "/api/v3/OrigDatablocks/" + "?access_token=" + token.id;
  console.log(url);
  var defaultDataset = readjson("orig.json");
  let fileName = "default.nxs";
  if (typeof dataset !== undefined) {
    if (dataset.hasOwnProperty('scientificMetadata')) {
      if (dataset.scientificMetadata.hasOwnProperty('file_name')) {
        fileName = dataset.scientificMetadata.file_name;
      }
    }
  }
  let orig = {
    "size": 0,
    "dataFileList": [
      {
        "path": fileName,
        "size": 0,
        "time": dataset.endTime,
        "chk": "34782",
        "uid": "101",
        "gid": "101",
        "perm": "755"
      }
    ],
    "ownerGroup": defaultDataset.ownerGroup,
    "accessGroups": defaultDataset.accessGroups,
    "datasetId": dataset.pid
  }

  // console.log(orig);
  let options1 = {
    url: url,
    method: "POST",
    body: orig,
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