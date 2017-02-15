var gulp = require("gulp");
var path = require("path");
var del = require("del");
var tslint = require("gulp-tslint");
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");
var shell = require("gulp-shell");
var reporters = require("jasmine-reporters");
var Reporter = require("jasmine-terminal-reporter");
var typedoc = require("gulp-typedoc");

gulp.task("install:typings", shell.task("typings install"));

gulp.task("clean", function(cb) { del("lib", cb); });
gulp.task("clean:typings", function (cb) { del("src/typings", cb); });

gulp.task("compile", shell.task("tsc", {cwd: path.join(__dirname, "src")}));

gulp.task("lint", function(){
	return gulp.src(["src/**/*.ts"])
		.pipe(tslint())
		.pipe(tslint.report());
});

gulp.task("lint-md", function(){
	return gulp.src(["**/*.md", "!**/node_modules/**/*.md"])
		.pipe(shell(["mdast <%= file.path %> --frail --no-stdout --quiet"]));
});

gulp.task("test", function(cb) {
	var jasmineReporters = [ new Reporter({
			isVerbose: true,
			showColors: true,
			includeStackTrace: true
		}),
		new reporters.JUnitXmlReporter()
	];
	gulp.src(["lib/**/*.js"])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src("spec/**/*[sS]pec.js")
				.pipe(jasmine({ reporter: jasmineReporters}))
				.pipe(istanbul.writeReports({ reporters: ["text", "cobertura", "lcov"] }))
				.on("end", cb);
		});
});

gulp.task("typedoc", function() {
	// typedocのexcludeが正しく動けば、tsconfig.filesGlobをsrcに指定して、index.tsをexcludeに指定すればよさそう
	return gulp
		.src([
			"./typings/**/*.ts",
			"./node_modules/@akashic/akashic-engine/lib/main.d.ts",
			"./src/Box2D.ts",
			"./src/Box2DTypes.ts",
			"./src/Box2DOptions.ts"
		])
		.pipe(typedoc({
			module: "commonjs",
			target: "es5",
			out: "doc/",
			name: "akashic-box2d",
			includeDeclarations: false
		}));
});

gulp.task("typedoc:copy", function() {
	return gulp.src("img/**/*.png").
		pipe(gulp.dest("doc/img/"));
});

gulp.task("default", ["compile"]);
