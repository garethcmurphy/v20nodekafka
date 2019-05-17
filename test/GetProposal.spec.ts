import { GetProposal } from './../src/GetProposal';
var assert = require('assert');
describe('Array', function() {
    it('should return default proposal string', function() {
      let proposal = new GetProposal();
      let id = proposal.get();
      assert.equal(id, "GH43YU");
    });
});