"use strict";

const rp = require("request-promise");

export class GetProposal {
  proposalId = "GH43YU";

  getDate() {
    return new Date(Date.now());
  }

  async get() {
    // login to catamel
    let accessToken = "fhs";

    let base_url = "http://localhost:3000/Proposals/findByInstrumentAndDate?instrument=V20&measureTime=20190101";
    let url = base_url+"?access_token="+accessToken;

    let options = {
      url: url,
      method: "GET",
      json: true,
      rejectUnauthorized: false,
      requestCert: true
    };

    try {
      const response = await rp(options);
      Promise.resolve(response);
    } catch (error) {
      console.log(url);
      console.log(error);
      return Promise.reject(error);
    }

    // get proposal from catamel

    return this.proposalId;
  }
}

if (require.main === module) {
  let read = new GetProposal();
  let proposalId = read.get();
  console.log(proposalId);
}
