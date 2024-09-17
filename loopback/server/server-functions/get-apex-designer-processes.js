module.exports = function () {
	let processes = [];

	function requireServerFunction(path) {
		try {
			return require(path);
		} catch(err) {}
	}


	return processes;
}