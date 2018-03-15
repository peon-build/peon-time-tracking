//https://www.npmjs.com/package/chokidar
//https://www.npmjs.com/package/glob
//https://www.npmjs.com/package/commander

const path = require('path');
const program = /** @type {local.Command}*/require('commander');
const core = /** @type {PeonBuild.TimeTracking}*/require('./core/index')();
const log = /** @type {PeonBuild.Log}*/require('@peon-build/peon-log')();

const globWiki = 'https://en.wikipedia.org/wiki/Glob_(programming)';
const watchDefault = "**/*";
const ignoreDefault = "**/node_modules/**";
const logLevelDefault = log.LogLevel.Info;

/**
 * Fill settings
 * @param {local.Command=} env
 * @param {PeonBuild.TimeTrackingSetting=} settings
 * @returns {PeonBuild.TimeTrackingSetting}
 */
function fillSetting(env, settings) {
	let options,
		option,
		value,
		name,
		i;

	//no provided
	if (!env) {
		return settings;
	}

	//normalize
	options = /** @type {Array.<local.Option>}*/env.options || [];
	settings = settings || {
		watchPattern: watchDefault,
		ignorePattern: ignoreDefault,
		logLevel: logLevelDefault
	};
	//iterate options and try to read data
	for (i = 0; i < options.length; i++) {
		option = options[i].long;
		name = option.replace("--", "");

		switch (name) {
		case "watch-pattern":
			value = env["watchPattern"] || "";
			settings.watchPattern = processPaths(value) || settings.watchPattern;
			break;
		case "ignore-pattern":
			value = env["ignorePattern"] || "";
			settings.ignorePattern = processPaths(value) || settings.ignorePattern;
			break;
		case "log-level":
			value = env["logLevel"];
			settings.logLevel = value || settings.logLevel;
			break;
		default:
			break;
		}
	}
	//parent
	fillSetting(env.parent, settings);
	//return settings
	return settings;
}

/**
 * Process paths
 * @param {string} arg
 * @return {Array|null|string}
 */
function processPaths(arg) {
	let paths = arg.split(","),
		array = [],
		i;

	//no provided arg
	if (!arg) {
		return null;
	}
	//only one path
	if (paths.length === 1) {
		return path.resolve(__dirname, paths[0]);
	}
	//process all
	for (i = 0; i < paths.length; i++) {
		array.push(path.resolve(__dirname, paths[i]));
	}
	return array;
}

//options
program
	.version('1.0.0')
	.option('-wp, --watch-pattern <pattern>', `Watching glob pattern. See ${globWiki}. Current default is '${watchDefault}'.`)
	.option('-ip, --ignore-pattern <pattern>', `Ignore watching glob pattern. See ${globWiki}. Current default is '${ignoreDefault}'.`)
	.option('-l, --log-level <level>', `Set log level for log messages. Current default is '${logLevelDefault}'.`);

//start command
program
	.command('start')
	.description(`Start time tracking with specified parameters.`)
	.action((env) => {
		let setting = fillSetting(env);
		core.start(setting);
	});

//help :)
program.on('--help', function(){
	console.log('');
	console.log('');
	console.log('  Examples:');
	console.log('');
	console.log('    $ peon-tt --help');
	console.log('    $ peon-tt -wp src/**/*.* -ip **/node_modules/**,.idea/**,.grunt/** -l all');
	console.log('');
});

//parse data
program.parse(process.argv);