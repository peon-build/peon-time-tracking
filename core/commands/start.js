let chokidar = require('chokidar');
let log = /** @type {PeonBuild.Log}*/require('@peon-build/peon-log')();

/**
 * Banner
 * @param {PeonBuild.TimeTrackingSetting} setting
 */
function banner(setting) {
	//info
	log.title('Time tracking is active and set on $1.', [
		log.p.path(/** @type {Array}*/setting.watchPattern)
	]);

	//options
	log.setting("log level", "$1", [log.p.text(/** @type {string}*/setting.logLevel)]);
	log.setting("watch pattern", "$1", [log.p.text(/** @type {Array}*/setting.watchPattern)]);
	log.setting("ignore pattern", "$1", [log.p.text(/** @type {Array}*/setting.ignorePattern)]);
	//space
	log.space();
}

/**
 * Watcher
 * @param {PeonBuild.TimeTrackingSetting} setting
 * @param {PeonBuild.TimeTrackingCommands.StartState} state
 */
function watcher(setting, state) {
	let watcher;

	//init state
	state.watchedFiles = state.watchedFiles || [];
	state.ready = false;
	//init watcher
	watcher = chokidar.watch(setting.watchPattern, {
		ignored: [/(^|[\/\\])\../, setting.ignorePattern],
		persistent: true
	});

	watcher
		.on('error', onError.bind(watcher))
		.on('add', onAdd.bind(watcher, state))
		.on('unlink', onUnlink.bind(watcher, state))
		.on('ready', onReady.bind(watcher, state))
		.on('change', onChange.bind(watcher, state));
}

/**
 * On ready
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTrackingCommands.StartState} state
 */
function onReady(state) {
	let directories = directoriesCount(this.getWatched()),
		files = state.watchedFiles.length;

	log.quote(true, 'Initial scan for time tracking complete. Found $1 files in $2 directories.', [
		log.p.number(files.toString()),
		log.p.number(directories.toString())
	]);
	log.log('Time tracking is ready for changes!');

	state.ready = true;
}

/**
 * On add
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTrackingCommands.StartState} state
 * @param {string} path
 */
function onAdd(state, path) {
	//add file
	state.watchedFiles.push(path);
	//report
	log.filename("Adding file $1", [
		log.p.path(path)
	]);

	//TODO: Save into log
}

/**
 * On change
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTrackingCommands.StartState} state
 * @param {string} path
 * @param {Stats|null} stats
 */
function onChange(state, path, stats) {
	//report
	log.filename("Changed file $1 with size $2.", [
		log.p.path(path),
		log.p.underline(stats ? stats.size.toString() : "unknown")
	]);

	//TODO: Save into log
}

/**
 * On unlink
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTrackingCommands.StartState} state
 * @param {string} path
 */
function onUnlink(state, path) {
	let index = state.watchedFiles.indexOf(path);

	//remove file
	if (index >= 0) {
		state.watchedFiles.splice(index, 1);
	}
	//report
	log.filename("Removing file $1", [
		log.p.path(path)
	]);

	//TODO: Save into log
}

/**
 * On error
 * @this {FSWatcher}
 * @param {Error} error
 */
function onError(error) {
	//report
	log.error("Error occurred in time tracking watcher:  $1", [
		log.p.underline(error.message)
	]);
}

/**
 * Directories Counts
 * @param {Object.<string, Array>} watchedPaths
 * @return {number}
 */
function directoriesCount(watchedPaths) {
	let name,
		filesCount,
		directories = 0;

	for (name in watchedPaths) {
		if (watchedPaths.hasOwnProperty(name)) {
			//files count
			filesCount = watchedPaths[name].length;
			//inc directories
			if (filesCount > 0) {
				directories++;
			}
		}
	}

	return directories;
}

/**
 * Command start
 * @param {PeonBuild.TimeTrackingSetting} setting
 */
function commandStart(setting) {
	let state = /** @type {PeonBuild.TimeTrackingCommands.StartState}*/{};

	//set logger level
	log.level(setting.logLevel);
	//run and prepare
	banner(setting);
	watcher(setting, state);
}
//export
module.exports = commandStart;