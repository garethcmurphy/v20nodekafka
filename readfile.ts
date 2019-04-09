"use strict";


export class ReadFile {

	read() {
		var filename = 'out.json';
		const fs = require('fs');
		var scimetObject = JSON.parse(fs.readFileSync(filename, 'utf8'));
		let newObject = this.parse(scimetObject);
		console.log(JSON.stringify(newObject, null,2 ));
	}

	parse(scimetObject) {
		let newObject = {};
		let title = "V20 sample data";
		let dateNow = new Date(2018, 1, 1);
		let sample_description = "";
		let chopper_rotation_speed_1 = { u: "Hz", v: "14" };
		let fileName = "default.nxs"
		if (scimetObject.hasOwnProperty('file_attributes')) {
		  fileName = scimetObject.file_attributes.file_name;
		}
		if (scimetObject.hasOwnProperty('nexus_structure')) {
			if (scimetObject.nexus_structure.hasOwnProperty('children')) {
				let entry = scimetObject.nexus_structure.children.find(child => child.name === "entry");
				if (entry.hasOwnProperty('children')) {
					console.log(entry);

					const titleObject = entry.children.find(child => child.name === "title");
					if (titleObject !== undefined) {
						if (titleObject.hasOwnProperty('values')) {
							console.log(titleObject);
							title = titleObject.values;
						}
					}
					const startObject = entry.children.find(child => child.name === "start_time");
					if (startObject !== undefined) {
						if (startObject.hasOwnProperty('values')) {
							console.log(startObject);
							dateNow = startObject.values;
						}
					}

					const sampleObject = entry.children.find(child => child.name === "sample");
					if (sampleObject !== undefined) {
						console.log(sampleObject);
						if (sampleObject.hasOwnProperty('children')) {
							const sample_child = sampleObject.children.find(child => child.name === "description");
							if (sample_child.hasOwnProperty('values')) {
								sample_description = sample_child.values;
							}
						}
					}

					const instrumentObject = entry.children.find(child => child.name === "instrument");
					if (instrumentObject.hasOwnProperty('children')) {
						let chop1 = instrumentObject.children[0];
						if (chop1.hasOwnProperty('children')) {
							const chop1_child = chop1.children.find(child => child.name == "speed");
							if (chop1_child) {
								chopper_rotation_speed_1.v = chop1_child.values;
							}
						}
					}
				}
				//delete scimetObject['nexus_structure']['children'][0]['children'][4]['children'][8];
			}
		}

		newObject["start_time"] = dateNow;
		newObject["file_name"] = fileName;
		newObject["chopper_rotation_speed_1"] = chopper_rotation_speed_1;
		newObject["chopper_rotation_speed_2"] = chopper_rotation_speed_1;
		newObject["sample_description"] = sample_description;


		return newObject;




	}


}



if (require.main === module) {
	let read = new ReadFile();
	read.read();
}