"use strict";

export class GetProposal {
  proposalId = "GH43YU";

  proposal = {
    proposalId: "GH43YU",
    MeasurementPeriodList: [
      {
        start: "2019-05-27T11:03:32.595Z",
        end: "2019-05-29T11:03:32.595Z"
      }
    ]
  };
  proposalArray = [];

    constructor() {
        this.proposalArray.push(this.proposal);
  }

  checkIfDateInProposalRange() {
    let today = new Date(Date.now());
    for (const prop of this.proposalArray) {
      let x = 0;
    }
    return 0;
  }

  getDate() {
    return new Date(Date.now());
  }

  get() {
    return this.proposalId;
  }
}

if (require.main === module) {
  let read = new GetProposal();
  let proposalId = read.get();
  console.log(proposalId);
}
