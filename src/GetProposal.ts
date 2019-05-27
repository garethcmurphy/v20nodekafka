"use strict";

export class GetProposal {
  proposalId = "GH43YU";
  proposal = {
    proposalId: "GH43YU",
    MeasurementPeriodList: [
      {
        start: "2019-05-27T11:03:32.595Z",
        end: "2019-05-27T11:03:32.595Z"
      }
    ]
  };

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
