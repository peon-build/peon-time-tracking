//https://www.npmjs.com/package/chokidar
//https://www.npmjs.com/package/glob
//https://www.npmjs.com/package/commander

const log = /** @type {PeonBuild.Log}*/require('./log');
const program = /** @type {local.Command}*/require('commander');
const commands = /** @type {PeonBuild.TimeTrackingCommands}*/require('./commands')();

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
			settings.watchPattern = value || settings.watchPattern;
			break;
		case "ignore-pattern":
			value = env["ignorePattern"] || "";
			settings.ignorePattern = value || settings.ignorePattern;
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
		let setting = fillSetting(env),
			directory = process.cwd();

		commands.start(directory, setting);
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