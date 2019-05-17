"use strict";

export class GetProposal {
    proposalId = "GH43YU";

    getDate(){
        return new Date(Date.now());
    }

    get(){

        return this.proposalId;
    }
}


if (require.main === module) {
	let read = new GetProposal();
    let proposalId = read.get();
    console.log(proposalId);
}
