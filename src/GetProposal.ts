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
  proposalArray = [
    {
      proposalId: "67JH32",
      MeasurementPeriodList: [
        {
          start: "2018-05-29T00:00:01.595Z",
          end: "2019-05-28T23:59:59.595Z"
        }
      ]
    },
    {
      proposalId: "KKXXYY",
      MeasurementPeriodList: [
        {
          start: "2019-05-29T00:00:01.595Z",
          end: "2019-06-07T23:59:59.595Z"
        }
      ]
    },
    {
      proposalId: "32768V",
      MeasurementPeriodList: [
        {
          start: "2019-06-07T00:00:01.595Z",
          end: "2019-06-14T23:59:59.595Z"
        }
      ]
    }
  ];

  constructor() {
    this.proposalArray.push(this.proposal);
  }

  checkIfDateInProposalRange(dateiso: string) {
    let today = new Date(dateiso);
    let propId = "DEFAULT";
    for (const prop of this.proposalArray) {
      let x = 0;
      const beg = new Date(prop.MeasurementPeriodList[0].start);
      const end = new Date(prop.MeasurementPeriodList[0].end);
      if (today > beg && today < end) {
        console.log("in range", prop.proposalId) 
        propId = prop.proposalId;
      }
    }
    return propId;
  }

  getDate() {
    return new Date(Date.now());
  }

  get(dateiso: string) {
    console.log(dateiso);
    let propId = this.checkIfDateInProposalRange(dateiso);
    return propId;
  }
}

if (require.main === module) {
  let read = new GetProposal();
  const date = new Date(Date.now());
  const dateiso = date.toISOString();
  let proposalId = read.get(dateiso);
  const exdate = "2018-06-07T12:24:45.992Z";
  proposalId = read.get(exdate);
  console.log("proposal", proposalId);
}
