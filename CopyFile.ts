"use strict";
var fs = require("fs");
var client = require("scp2");

export class CopyFile {
  destination: string;
  userName: string;
  privateKey: string;
  path: string;
  constructor() {
    this.destination = "remote.com";
    this.userName = "remote.com";
    this.readConfig();
  }

  readConfig() {
    const filename = "configRemote.json";
    var remoteData = JSON.parse(fs.readFileSync(filename, "utf8"));
    this.destination = remoteData.remoteHost;
    this.userName = remoteData.userName;
    this.path = remoteData.path;
    this.privateKey = remoteData.privateKey;
  }

  

  copy() {
    client.scp(
      "file2.txt",
        {
          host: this.destination,
            username: this.userName,
            privateKey: fs.readFileSync(this.privateKey, "utf8"),
          path: this.path
      },
      function(err) {
        console.log(err);
      }
    );
  }
}

if (require.main === module) {
  let copier = new CopyFile();
  copier.copy();
}
