namespace PeonBuild.TimeTracking.Watcher {

	type State = {
		ready: boolean;
		watchedFiles: Array<string>;
	}

	type Settings = {
		watchPattern?: string | Array | RegExp;
		ignorePattern?: string | Array | RegExp;

		onReady?(state: State);
		onAdd?(state: State, path: string);
		onUnlink?(state: State, path: string);
		onChange?(state: State, path: string, stats: any);
		onError?(state: State, error: Error);
	}

}