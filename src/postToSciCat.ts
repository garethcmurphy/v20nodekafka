import { GetProposal } from "./GetProposal";
import { GetOrcid } from "./GetOrcid";
const { ReadFile } = require("./readfile");
var rp = require("request-promise");
import { readjson } from "./kafka";

export class SciCat {
  constructor() {
    const teststring = "test";
  }

  async postToSciCat(token, message, config, sampleId) {
    console.log("posting to scicat");
    var scimet = message.value.replace(/\n/g, "");
    console.log("offset", message.offset);
    var jsonFormattedString = scimet.replace(/\\\//g, "/");
    var defaultDataset = readjson("dataset.json");
    var scimetObject = JSON.parse(jsonFormattedString);
    const reader = new ReadFile();
    const parsedNexus = reader.parse(scimetObject);
    let dateNow = parsedNexus.start_time;
    let title = parsedNexus.title;
    let size = parsedNexus.size;
    console.log(parsedNexus);
    const prop = new GetProposal();
    const newprop = await prop.get(config, dateNow);
    const orc = new GetOrcid();

    let proposalId = "DEFAULT";
    let owner = "default";
    let principalInvestigator = "default";
    let pi_email = "default";
    let owner_email = "default";
    let orcid = "default";
    if (newprop.proposalId.length === 6) {
      proposalId = newprop.proposalId;
      owner = newprop.firstname + " " + newprop.lastname;
      principalInvestigator = newprop.pi_firstname + " " + newprop.pi_lastname;
      owner = newprop.firstname + " " + newprop.lastname;
      owner_email = newprop.ownerEmail;
      pi_email = newprop.pi_email;
      orcid = orc.get(owner);
    }
    console.log(newprop);
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
      config.scicatIP +
      "/api/v3/Datasets" +
      "?access_token=" +
      token.id;

    let delete_url =
      config.scicatIP +
      "/api/v3/Datasets/" +
      encodeURIComponent(prefix + job_id) +
      "?access_token=" +
      token.id;

    let delete_orig =
      config.scicatIP +
      "/api/v3/Datasets/" +
      encodeURIComponent(prefix + job_id) +
      "/origdatablocks";
    "?access_token=" + token.id;

    console.log(url);
    let dataset = {
      pid: scimetObject.job_id,
      principalInvestigator: principalInvestigator,
      endTime: dateNow,
      creationLocation: defaultDataset.creationLocation,
      dataFormat: defaultDataset.dataFormat,
      scientificMetadata: parsedNexus,
      owner: owner,
      ownerEmail: owner_email,
      orcidOfOwner: orcid,
      contactEmail: pi_email,
      sourceFolder: "/nfs/groups/beamlines/V20/" + proposalId,
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

    let option_del_orig = {
      url: delete_orig,
      method: "POST",
      body: dataset,
      json: true,
      rejectUnauthorized: false
    };

    try {
      //console.log(options1);
      console.log("delete origdatablocks", job_id);
      const response = await rp(option_del_orig);
      //console.log(response);
    } catch (error) {
      console.log(error);
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
      console.log("delete", job_id);
      const response = await rp(options_delete);
      //console.log(response);
    } catch (error) {
      console.log(error);
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

  async sampleToSciCat(token, data, config, sampleId) {
    console.log("sample to scicat");
    let url =
      config.scicatIP +
      "/api/v3/Samples/" +
      "?access_token=" +
      token.id;
    console.log(url);
    let dateNow = new Date(Date.now());
    var defaultDataset = readjson("sample.json");
    let sample_description = defaultDataset.description;
    if (data !== undefined) {
      if (data.hasOwnProperty("scientificMetadata")) {
        if (data.scientificMetadata.hasOwnProperty("nexus_structure")) {
          sample_description =
            data.scientificMetadata["nexus_structure"]["children"][0][
              "children"
            ][5]["children"][0]["values"];
        }
      }
    }
    let sample = {
      sampleId: sampleId,
      owner: defaultDataset.owner,
      description: sample_description,
      createdAt: dateNow,
      sampleCharacteristics: {
        instrument: "V20",
        id: data.pid,
        description: sample_description
      },
      attachments: ["string"],
      ownerGroup: defaultDataset.ownerGroup,
      accessGroups: defaultDataset.accessGroups
    };
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
  async origToSciCat(token, dataset, message, config, sampleId) {
    console.log("orig to scicat" + dataset.pid);
    let url =
      config.scicatIP +
      "/api/v3/OrigDatablocks/" +
      "?access_token=" +
      token.id;
    console.log(url);
    var defaultDataset = readjson("orig.json");
    let fileName = "default.nxs";
    if (dataset !== undefined) {
      if (dataset.hasOwnProperty("scientificMetadata")) {
        if (dataset.scientificMetadata.hasOwnProperty("file_name")) {
          fileName = dataset.scientificMetadata.file_name;
        }
      }
    }
    let orig = {
      size: 0,
      dataFileList: [
        {
          path: fileName,
          size: 0,
          time: dataset.endTime,
          chk: "34782",
          uid: "101",
          gid: "101",
          perm: "755"
        }
      ],
      ownerGroup: defaultDataset.ownerGroup,
      accessGroups: defaultDataset.accessGroups,
      datasetId: dataset.pid
    };

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
}
