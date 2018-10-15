const la = require('./custom/lang');

var setGender = function (mongo, id, gender_str, callback) {
	var genderid = 0;
	if (gender_str == la.KEYWORD_GENDER + 'nam') {
		genderid = 1;
	} else if (gender_str == la.KEYWORD_GENDER + 'nu') {
		genderid = 2;
	} else if (gender_str == la.KEYWORD_GENDER + 'khong') {
		genderid = 0;
	} else {
		callback(-1, id); // no valid value
		return;
	}
	mongo.conn.collection('gender').updateOne({uid: id}, {$set: {uid: id, gender: genderid}},
		{upsert: true}, function (error, results, fields) {
		if (error) {
			callback(-2, id); // ERR writing to db
			console.log(error);
		} else {
			callback(genderid, id); // OK
		}
	});
};

var getGender = function (mongo, id, callback, facebook) {
	mongo.conn.collection('gender').find({uid: id})
	.toArray(function (error, results, fields) {
		if (error) {
			callback(0);
			console.log(error);
			//if (REPORT_COUNT<70) postErr(JSON.stringify(error));
		} else {
			if (results.length > 0) {
				callback(results[0].gender);
			} else {
				// if not found, fetch from facebook
				facebook.getFbData(id, function(data) {
					data = JSON.parse(data);
					if (!data.gender) {
						setGender(mongo, id, la.KEYWORD_GENDER + 'khong', function(ret, id){});
						callback(0);
					} else if (data.gender == 'male') {
						setGender(mongo, id, la.KEYWORD_GENDER + 'nu', function(ret, id){});
						callback(2);
					} else if (data.gender == 'female')  {
						setGender(mongo, id, la.KEYWORD_GENDER + 'nam', function(ret, id){});
						callback(1);
					}
				});
			}
		}
	});
}

module.exports = {
	setGender: setGender,
	getGender: getGender
};