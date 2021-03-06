"use strict";

const fs = require("fs");
const rp = require("request-promise");

export class GetProposal {
  proposalId = "GH43YU";
  proposal: any;

  getDate() {
    return new Date(Date.now());
  }

  readjson(filename: string) {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
  }

  async get(config:any, dateNow: string) {
    // login to catamel
    let accessToken = "fhs";



    let base_url = config.scicatIP +"/api/v3/";
    let login_url = base_url + "Users/login";
    let instrument = "V20";
    let measureTime = encodeURIComponent(dateNow);
    let prop_url =
      base_url +
      "Proposals/findByInstrumentAndDate?instrument=" +
      instrument +
      "&measureTime=" +
      measureTime;

    const rawdata = this.readjson("user.json");
    const options1 = {
      url: login_url,
      method: "POST",
      body: rawdata,
      json: true,
      rejectUnauthorized: false,
      requestCert: true
    };
    try {
      const response = await rp(options1);
      accessToken = response["id"];
      Promise.resolve(response);
    } catch (error) {
      Promise.reject(error);
    }
    let prop_url2 = prop_url + "&access_token=" + accessToken;
    console.log(prop_url2);

    let options = {
      url: prop_url2,
      method: "GET",
      json: true,
      rejectUnauthorized: false,
      requestCert: true
    };

    try {
      const response = await rp(options);
      Promise.resolve(response);
      if (response.hasOwnProperty('findByInstrumentAndDate')) {
        const resp = response['findByInstrumentAndDate'];
        this.proposal = resp;
        if (resp.hasOwnProperty('proposalId')) {
          this.proposalId = resp['proposalId'];
        }
      }
      //this.proposalId = response.findByInstrumentAndDate.proposalId;
      console.log(this.proposalId);
    } catch (error) {
      console.log(prop_url2);
      console.log(error);
      return Promise.reject(error);
    }

    // get proposal from catamel

    return this.proposal;
  }
}

if (require.main === module) {
  let read = new GetProposal();
  let date = "2019-05-28T00:01:00+0000";
  var config = read.readjson("config.json")
  read.get(config, date).then(result => {
    console.log("successfully found", result);
  });
}
