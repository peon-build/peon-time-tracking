namespace PeonBuild {

	type TimeTrackingCommands = {
		start(cwd: string, setting: PeonBuild.TimeTrackingSetting);
	}

	type TimeTrackingSetting = {
		watchPattern?: string;
		ignorePattern?: string;
		logLevel?: PeonBuild.LogLogLevel;
	}

}