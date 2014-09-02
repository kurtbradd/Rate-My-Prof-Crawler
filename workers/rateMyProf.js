exports.crawlReviews = function crawlUrl () {
	// check for redis hit
	// if hit return array of reviews
	// if miss GET url
	// parse site for reviews
	// store url:array in redis
	// return array
	// or return error
}

exports.crawlProfessorInfo = function crawlProfessorInfo (url) {
	/*
	GET url
	parse professor info
	return json or error
	*/
}

exports.createPaginationUrls = function createPaginationUrls (url) {
	/*
	GET url
	parse # of comments
	create urls based on num comments
	return [urls] or error
	*/
}

function parseSiteForReviews (html) {
	// use cheerio to parse DOM
}