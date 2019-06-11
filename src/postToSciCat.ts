import { GetProposal } from "./GetProposal";
const { ReadFile } = require("./readfile");
var rp = require("request-promise");
import { readjson } from "./kafka";
export async function postToSciCat(token, message, config, sampleId) {
  console.log("posting to scicat");
  var scimet = message.value.replace(/\n/g, "");
  console.log("offset", message.offset);
  var jsonFormattedString = scimet.replace(/\\\//g, "/");
  var defaultDataset = readjson("dataset.json");
  var scimetObject = JSON.parse(jsonFormattedString);
  const reader = new ReadFile();
  const newObject2 = reader.parse(scimetObject);
  let dateNow = newObject2.start_time;
  let title = newObject2.title;
  let size = newObject2.size;
  console.log(newObject2);
  const prop = new GetProposal();
  const newpropId = await prop.get(dateNow);
  let proposalId = "DEFAULT";
  if (newpropId.length === 6) {
    proposalId = newpropId;
  }
  console.log(newpropId);
  let job_id = "x";
  if (scimetObject.hasOwnProperty("job_id")) {
    job_id = scimetObject["job_id"];
  }
  console.log(job_id);
  const prefix = "20.500.12269/";
  const whereobj = { pid: prefix + job_id };
  const wherestr = encodeURIComponent(JSON.stringify(whereobj));
  console.log(wherestr);
  let url =
    "http://" +
    config.scicatIP +
    "/api/v3/Datasets" +
    "?access_token=" +
    token.id;

  let delete_url=
    "http://" +
    config.scicatIP +
    "/api/v3/Datasets/" +
    encodeURIComponent(prefix+job_id) +
    "?access_token=" +
    token.id;

  let delete_orig=
    "http://" +
    config.scicatIP +
    "/api/v3/Datasets/" +
    encodeURIComponent(prefix+job_id) +
    "/origdatablocks"
    "?access_token=" +
    token.id;

  console.log(url);
  let dataset = {
    pid: scimetObject.job_id,
    principalInvestigator: defaultDataset.principalInvestigator,
    endTime: dateNow,
    creationLocation: defaultDataset.creationLocation,
    dataFormat: defaultDataset.dataFormat,
    scientificMetadata: newObject2,
    owner: defaultDataset.owner,
    ownerEmail: defaultDataset.ownerEmail,
    orcidOfOwner: defaultDataset.orcidOfOwner,
    contactEmail: defaultDataset.contactEmail,
    sourceFolder: "/users/detector/experiments/V20/"+proposalId,
    size: size,
    packedSize: size,
    creationTime: dateNow,
    type: "raw",
    validationStatus: "string",
    keywords: defaultDataset.keywords,
    description: defaultDataset.description,
    datasetName: title,
    classification: defaultDataset.classification,
    license: defaultDataset.license,
    version: defaultDataset.version,
    isPublished: defaultDataset.isPublished,
    ownerGroup: defaultDataset.ownerGroup,
    accessGroups: defaultDataset.accessGroups,
    createdBy: "string",
    updatedBy: "string",
    createdAt: dateNow,
    updatedAt: dateNow,
    sampleId: sampleId,
    proposalId: proposalId,
    datasetlifecycle: {
      archivable: true,
      retrievable: false,
      publishable: true,
      dateOfDiskPurging: dateNow,
      archiveRetentionTime: dateNow,
      dateOfPublishing: dateNow,
      isOnCentralDisk: true,
      archiveStatusMessage: "string",
      retrieveStatusMessage: "string",
      archiveReturnMessage: {},
      retrieveReturnMessage: {},
      exportedTo: "string",
      retrieveIntegrityCheck: true
    },
    history: [
      {
        id: "string"
      }
    ]
  };
  if (scimetObject.hasOwnProperty("cmd")) {
    if (scimetObject["cmd"] === "FileWriter_stop") {
      return;
    }
  }
  console.log(dataset.scientificMetadata);
  let options_delete = {
    url: delete_url,
    method: "DELETE",
    body: dataset,
    json: true,
    rejectUnauthorized: false
  };

  try {
    //console.log(options1);
    console.log('delete', job_id);
    const response = await rp(options_delete);
    //console.log(response);
  } catch (error) {
    console.log(error)
  }

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
