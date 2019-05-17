import { ReadFile } from "../src/readfile";

var assert = require('assert');
describe('readfile', function() {
    it('should have default filename', function() {
        let reader=new ReadFile();
      assert.equal(reader.filename,"out.json");
    });
});