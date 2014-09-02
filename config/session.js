module.exports = function (express) {

	console.log('Sessions Loaded');

	var MemoryStore = MemoryStore = express.session.MemoryStore;
	var sessionStore = new MemoryStore();

	return {
		store: sessionStore,
		config : {
				store: sessionStore,
				secret:'secret',
				key:'express.sid'
			}
	}
}