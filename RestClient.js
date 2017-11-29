var request = require ('request');

exports.getBalance = function getData(url, session, username, callback){
    request.get(url, {'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function(err,res,body){
        if(err){
            console.log(err);
        }else {
            callback(body, session, username);
        }
    });
};

//Creating the REST call
exports.addCardToAccount = function sendData(url, username, cardtype, linkedto){ //Sending data to server via the parameters
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',        //POSTMAN headers
            'Content-Type':'application/json'
        },
        json: {
            "username" : username,
            "cardtype" : cardtype,
            "linkedto" : linkedto
        }
      };
      
      request(options, function (error, response, body) {   //Parameters provided by request function
        if (!error && response.statusCode === 200) {        //Executing from response, 200 = OK
            console.log(body);
        }
        else{
            console.log(error);
        }
      });
};

exports.deleteCard = function deleteData(url,session, username , cardtype, id, callback){ 
    var options = {
        url: url + "\\" + id, //id tells function what to delete "\\" is syntax for escape sequence
        method: 'DELETE',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        }
    };

    request(options,function (err, res, body){ //blue function is callback function 
        if( !err && res.statusCode === 200){ //if ok log the body
            console.log(body);
            callback(body,session,username, cardtype);
        } else {                 //else log error to debug
            console.log(err); 
            console.log(res);
        }
    })

};

exports.getXRate = function getData(url,session,currencyType,callback){

    request.get(url, function (error, response, body) {
        if (!error) {
            callback(body,currencyType,session);
            // ----> Remember to change console.log(body);
        } else {
            console.log(error)
        }
    });
};


