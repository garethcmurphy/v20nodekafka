"use strict";


var fs = require('fs');
export class CopyFile {
    destination: string;
    constructor() {
        this.destination = "remote.com";
        this.readConfig();
        
    }

    readConfig() {

        const filename = "configRemote.json";
        var remoteData = JSON.parse(fs.readFileSync(filename, "utf8"));
        this.destination = remoteData.remoteHost;

    }





}