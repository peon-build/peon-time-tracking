let chokidar = require('chokidar');

/**
 * Function or empty
 * @param {Function|undefined} fnc
 * @return {Function}
 */
function fn(fnc) {
	return fnc || function () {};
}

/**
 * Watcher
 * @param {PeonBuild.TimeTracking.Watcher.Settings} settings
 * @return {FSWatcher}
 */
function watcher(settings) {
	let watcher,
		state = /** @type {PeonBuild.TimeTracking.Watcher.State}*/{};

	//init state
	state.watchedFiles = state.watchedFiles || [];
	state.ready = false;
	//init watcher
	watcher = chokidar.watch(settings.watchPattern, {
		ignored: [/(^|[\/\\])\../, settings.ignorePattern],
		persistent: true
	});

	watcher
		.on('error', (err) => {
			//on error
			fn(settings.onReady).call(watcher, err);
		})
		.on('add', (path) => {
			//add file
			state.watchedFiles.push(path);
			//on add
			fn(settings.onAdd).call(watcher, state, path)
		})
		.on('unlink', (path) => {
			let index = state.watchedFiles.indexOf(path);

			//remove file
			if (index >= 0) {
				state.watchedFiles.splice(index, 1);
			}
			//on unlink
			fn(settings.onUnlink).call(watcher, state, path)
		})
		.on('ready', () => {
			//set as ready
			state.ready = true;
			//ready
			fn(settings.onReady).call(watcher, state);
		})
		.on('change', (path, states) => {
			//on change
			fn(settings.onChange).call(watcher, state, path, states);
		});
}
//exports
module.exports = watcher;

