let commandStart = require('./commands/start');


function peonTimeTracking() {
	//interface
	return {

		/**
		 * Start
		 * @param {PeonBuild.TimeTrackingSetting} setting
		 */
		start(setting) {
			commandStart(setting);
		}

	}
}
//export
module.exports = peonTimeTracking;