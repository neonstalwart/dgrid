define([
	"dojo/_base/lang",
	"dojo/_base/Deferred"
], function (lang, Deferred) {
	// summary:
	//		Creates a store that maintains a reference to the previous query and will cancel it if
	//		another query is received before that one is resolved.
	return function(store){
		var pendingQuery;

		return lang.delegate(store, {
			query: function(query, options){
				function clearPending() {
					if (pendingQuery === results) {
						pendingQuery = null;
					}
				}

				var queryResult = store.query(query, options),
					canceled = false,
					results = new Deferred(function () {
						canceled = true;
						clearPending();
					});

				if (pendingQuery) {
					pendingQuery.cancel();
				}

				pendingQuery = results;

				Deferred.when(results, clearPending, clearPending);
				Deferred.when(queryResult, function (data) {
					if (!canceled) {
						results.resolve(data);
					}
					return data;
				}, function (e) {
					if (!canceled) {
						results.reject(e);
					}
					throw e;
				});

				return lang.delegate(queryResult, results);
			}
		});
	};
});