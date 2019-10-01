"use strict";

var fs = require("fs");
export class ReadFile {
  filename = "outsmall.json";

  read() {
    const fs = require("fs");
    var scimetObject = JSON.parse(fs.readFileSync(this.filename, "utf8"));
    let newObject = this.parse(scimetObject);
    // console.log(JSON.stringify(newObject, null, 2));
  }

  measurement(unit: string, value: number) {
    const measure = {
      type: "measurement",
      value: value,
      unit: unit
    };
    return measure;
  }

  parse(scimetObject) {
    let newObject = {};
    let title = "V20 data";
    let dateNow = new Date(2018, 1, 1);
    let sample_description = "V20 sample";
    let chopper_rotation_speed_1 = this.measurement("Hz", 0);
    let chopper_rotation_speed_2 = this.measurement("Hz", 0);
    let chopper_rotation_speed_3 = this.measurement("Hz", 0);
    let chopper_rotation_speed_4 = this.measurement("Hz", 0);
    let chopper_rotation_speed_5 = this.measurement("Hz", 0);
    let chopper_rotation_speed_6 = this.measurement("Hz", 0);
    let chopper_rotation_speed_7 = this.measurement("Hz", 0);
    let chopper_rotation_speed_8 = this.measurement("Hz", 0);
    let chopper_phase_1 = this.measurement("deg", 0);
    let chopper_phase_2 = this.measurement("deg", 0);
    let chopper_phase_3 = this.measurement("deg", 0);
    let chopper_phase_4 = this.measurement("deg", 0);
    let sample_temperature = this.measurement("C", 0);
    let fileName = "default.nxs";
    let runNumber = { type: "number", value: 0, unit: "" };
    if (scimetObject.hasOwnProperty("file_attributes")) {
      fileName = scimetObject.file_attributes.file_name;
      const runNumberValue = fileName
        .split("_")
        .pop()
        .slice(0, -4);
      runNumber = { type: "number", value:  parseInt(runNumberValue), unit: "" };
    }
    if (scimetObject.hasOwnProperty("nexus_structure")) {
      if (scimetObject.nexus_structure.hasOwnProperty("children")) {
        let entry = scimetObject.nexus_structure.children.find(
          child => child.name === "entry"
        );
        if (entry.hasOwnProperty("children")) {
          console.log(entry);

          const titleObject = entry.children.find(
            child => child.name === "title"
          );
          if (titleObject !== undefined) {
            if (titleObject.hasOwnProperty("values")) {
              // console.log(titleObject);
              title = titleObject.values;
            }
          }
          const startObject = entry.children.find(
            child => child.name === "start_time"
          );
          if (startObject !== undefined) {
            if (startObject.hasOwnProperty("values")) {
              // console.log(startObject);
              dateNow = startObject.values;
            }
          }

          const sampleObject = entry.children.find(
            child => child.name === "sample"
          );
          if (sampleObject !== undefined) {
            // console.log(sampleObject);
            if (sampleObject.hasOwnProperty("children")) {
              const sample_child = sampleObject.children.find(
                child => child.name === "description"
              );
              if (sample_child !== undefined) {
                if (sample_child.hasOwnProperty("values")) {
                  sample_description = sample_child.values;
                }
              }
            }
          }
          let tmpObject = {};
          for (let i = 1; i < 9; i++) {
            let tmpSpeed = this.measurement("Hz", 0);
            this.get_chopper(
              entry,
              tmpSpeed,
              "chopper_" + i.toString(),
              "speed"
            );
            tmpObject["chopper_speed_" + i.toString()] = tmpSpeed;
          }
          this.get_chopper(
            entry,
            chopper_rotation_speed_1,
            "chopper_1",
            "speed"
          );
          this.get_chopper(
            entry,
            chopper_rotation_speed_2,
            "chopper_2",
            "speed"
          );
          this.get_chopper(
            entry,
            chopper_rotation_speed_3,
            "chopper_3",
            "speed"
          );
          this.get_chopper(
            entry,
            chopper_rotation_speed_4,
            "chopper_4",
            "speed"
          );
          this.get_chopper(entry, chopper_phase_1, "chopper_1", "phase");
          this.get_chopper(entry, chopper_phase_2, "chopper_2", "phase");
          this.get_chopper(entry, chopper_phase_3, "chopper_3", "phase");
          this.get_chopper(entry, chopper_phase_4, "chopper_4", "phase");
        }
      }
      //delete scimetObject["nexus_structure"]["children"][0]["children"][4]["children"][8];
    }

    const size = this.getFileSize(fileName);

    newObject["chopper_1_phase"] = chopper_phase_1;
    newObject["chopper_1_speed"] = chopper_rotation_speed_1;
    newObject["chopper_2_phase"] = chopper_phase_2;
    newObject["chopper_2_speed"] = chopper_rotation_speed_2;
    newObject["chopper_3_phase"] = chopper_phase_3;
    newObject["chopper_3_speed"] = chopper_rotation_speed_3;
    newObject["chopper_4_phase"] = chopper_phase_4;
    newObject["chopper_4_speed"] = chopper_rotation_speed_4;
    newObject["file_name"] = { type: "string", value: fileName, unit: "" };
    newObject["runNumber"] = runNumber;
    newObject["sample_description"] = {
      type: "string",
      value: sample_description,
      unit: ""
    };
    newObject["sample_temperature"] = sample_temperature;
    newObject["size"] = { type: "measurement", value: size, unit: "bytes" };
    newObject["start_time"] = { type: "date", value: dateNow, unit: "" };
    newObject["title"] = { type: "string", value: title, unit: "" };

    return newObject;
  }

  getFileSize(filePath: string) {
    let fileSize = 0;
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      fileSize = stats.size;
    }
    return fileSize;
  }

  private get_chopper(
    entry: any,
    chopper_rotation_speed_1: { type: string; unit: string; value: number },
    chopper: string,
    variable: string
  ) {
    const instrumentObject = entry.children.find(
      child => child.name === "instrument"
    );
    if (instrumentObject !== undefined) {
      if (instrumentObject.hasOwnProperty("children")) {
        //console.log(instrumentObject.children);
        const chop1_child = instrumentObject.children.find(
          child => child.name == chopper
        );
        if (chop1_child !== undefined) {
          if (chop1_child.hasOwnProperty("children")) {
            //console.log("speed");
            const speed_child = chop1_child.children.find(
              child => child.name == variable
            );
            if (speed_child != undefined) {
              chopper_rotation_speed_1.value = speed_child.values;
            }
          }
        }
      }
    }
  }
}

if (require.main === module) {
  let read = new ReadFile();
  read.read();
}
