const log = /** @type {PeonBuild.Log}*/require('../log');
const core = /** @type {PeonBuild.TimeTracking}*/require('../core')();
const path = require('path');

/**
 * Banner
 * @param {string} cwd
 * @param {PeonBuild.TimeTrackingSetting} setting
 */
function banner(cwd, setting) {
	//info
	log.title('Time tracking is active and set on $1.', [
		log.p.path(/** @type {Array}*/setting.watchPattern)
	]);

	//options
	log.setting("current working directory", "$1", [
		log.p.path(cwd)
	]);
	log.setting("log level", "$1", [log.p.text(/** @type {string}*/setting.logLevel)]);
	log.setting("watch pattern", "$1", [log.p.text(/** @type {Array}*/setting.watchPattern)]);
	log.setting("ignore pattern", "$1", [log.p.text(/** @type {Array}*/setting.ignorePattern)]);
	//space
	log.space();
}

/**
 * Watcher
 * @param {string} cwd
 * @param {PeonBuild.TimeTrackingSetting} setting
 * @return {FSWatcher}
 */
function watcher(cwd, setting) {
	//init watcher
	return core.watcher({
		ignorePattern: processPaths(cwd, setting.ignorePattern),
		watchPattern: processPaths(cwd, setting.watchPattern),
		onAdd: onAdd,
		onError: onError,
		onUnlink: onUnlink,
		onReady: onReady,
		onChange: onChange
	});
}

/**
 * On ready
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTracking.Watcher.State} state
 */
function onReady(state) {
	let directories = directoriesCount(this.getWatched()),
		files = state.watchedFiles.length;

	log.quote(true, 'Initial scan for time tracking complete. Found $1 files in $2 directories.', [
		log.p.number(files.toString()),
		log.p.number(directories.toString())
	]);
	log.log('Time tracking is ready for changes!');
}

/**
 * On add
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTracking.Watcher.State} state
 * @param {string} path
 */
function onAdd(state, path) {
	//report
	log.filename("Adding file $1. Now totally watching $2 files.", [
		log.p.path(path),
		log.p.number(state.watchedFiles.length.toString())
	]);

	//TODO: Save into log
}

/**
 * On change
 * @this {FSWatcher}
 * @param {PeonBuild.TimeTracking.Watcher.State} state
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
 * @param {PeonBuild.TimeTracking.Watcher.State} state
 * @param {string} path
 */
function onUnlink(state, path) {
	//report
	log.filename("Removing file $1. Now totally watching $2 files.", [
		log.p.path(path),
		log.p.number(state.watchedFiles.length.toString())
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
 * Process paths
 * @param {string} dir
 * @param {string} arg
 * @return {Array|null|string}
 */
function processPaths(dir, arg) {
	let paths = arg.split(","),
		array = [],
		i;

	//no provided arg
	if (!arg) {
		return "";
	}
	//only one path
	if (paths.length === 1) {
		return path.resolve(dir, paths[0]).replace(/\\/g, "/");
	}
	//process all
	for (i = 0; i < paths.length; i++) {
		array.push(path.resolve(dir, paths[i]).replace(/\\/g, "/"));
	}
	return array;
}


/**
 * Command start
 * @param {string} cwd
 * @param {PeonBuild.TimeTrackingSetting} setting
 */
function commandStart(cwd, setting) {
	//set logger level
	log.level(setting.logLevel);
	//run and prepare
	banner(cwd, setting);
	watcher(cwd, setting);
}
//export
module.exports = commandStart;