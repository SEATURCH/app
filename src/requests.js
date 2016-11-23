//var nocache = require('superagent-no-cache');
import request from  'superagent';
import Promise from 'bluebird';

//var prefix = require('superagent-prefix')('/static');
var root = 'https://jsonplaceholder.typicode.com';
var goback = 'http://localhost:8080';

var getTest = function(id){
	return new Promise(function(resolve, reject){
		request
		  .get(root+'/posts/'+id)
		  .withCredentials()
		  .end(function(err, res){
		    if(!err && res.ok){
		    	resolve(res.body);
		    }else {
		    	reject();
		    }

	  	});
	});
}

var patientSearch = function(id){
	return new Promise(function(resolve, reject){
		request
		  .get(goback+'/patients/search?PatientUUID=2779123f-f4c3-43ec-b20a-a6fcbb0eb418')
		  .end(function(err, res){
		    if(!err && res.ok){
					resolve(res.body);
				}else {
					reject();
		    }
			});
		});
}

var authenticate = function(email, pass) {
    if (sessionStorage.token) {
      	delete sessionStorage.token;
    }
    // var proxyServer = "http://localhost:8080/";
    return new Promise(function(resolve, rejevect){
    	resolve(true);
    });
 //    return new Promise(function(resolve, reject){
	// 	request
	// 	  // .get(root+'/authenticate')
	// 	  .get(proxyServer)
	// 	  .withCredentials()
	// 	  .end(function(err, res){
	// 	    if(!err && res.ok){
	// 	    	resolve(res.ok );
	// 	    }else {
	// 	    	reject();
	// 	    }

	//   	});
	// });
  }

export default {
	authenticate:authenticate,
	testApi:getTest,
	patientSearch:patientSearch
};
