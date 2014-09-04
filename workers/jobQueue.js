var	kue 	= require('kue');
var	jobs 	= kue.createQueue();

kue.app.listen(3001);
console.log('Job Queue Loaded');

// cb(error, completed, progress)
exports.crawlProfessor = function crawlProfessor (jobData, cb) {
	var job = jobs.create('crawlProfessor', jobData);
	job.attempts(1);
	job
	.on('complete', function (){
		cb(null, true);
	})
	.on('failed', function (error){
		cb(error)
	})
	.on('progress', function (progress){
    cb(null, null, progress);
	})
	job.save();
}