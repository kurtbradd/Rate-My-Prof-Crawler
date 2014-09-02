var cluster = require('cluster')
var clusterWorkerSize = require('os').cpus().length;

if (cluster.isMaster) {
	for (var i = 0; i < clusterWorkerSize; i++) {
		cluster.fork();
	}
}
else {
	var	kue 	= require("kue");
	var	jobs 	= kue.createQueue();

	jobs.process('crawlProfessor', 1, function (job, done){
		console.log('got crawlProfessor, finished job');

		// in here create the need for new jobs;

		var job = jobs.create('crawlProfessorReviews', {});
		job
		.on('complete', function (){
			done()
		})
		job.save();
	});

	jobs.process('crawlProfessorReviews', 1, function (job, done){
		console.log('got crawlProfessorReviews, finished job');
		done()
	});

}


process.once( 'SIGINT', function (sig) {
  jobs.shutdown(function(err) {
		console.log( 'Kue is shut down.', err||'' );
		process.exit( 0 );
  }, 5000 );
});