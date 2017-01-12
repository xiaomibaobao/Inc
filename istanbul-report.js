/*eslint no-console: "ignore"*/

var fs = require('fs'),
    istanbul = require('istanbul'),
    reporter = new istanbul.Reporter(),
    collector = new istanbul.Collector(),
    Report = require('istanbul').Report,
    report = Report.create('html'),
    sync = true;

collector.add(JSON.parse(fs.readFileSync('./coverage.json', 'utf8')));
reporter.add('lcovonly');
reporter.addAll(['clover', 'cobertura']);
reporter.write(collector, sync, function () { console.log('done'); });
report.on('done', function () { console.log('done'); });
report.writeReport(collector);