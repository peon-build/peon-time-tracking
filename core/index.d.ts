namespace PeonBuild {

	type TimeTracking = {
		start(setting: PeonBuild.TimeTrackingSetting);
	}

	type TimeTrackingSetting = {
		watchPattern?: string | Array | RegExp;
		ignorePattern?: string | Array | RegExp;
		logLevel?: PeonBuild.LogLogLevel;
	}

}