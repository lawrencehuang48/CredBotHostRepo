var rest = require('../Restclient');
var builder = require('botbuilder');

exports.displayXRate = function getXRate(currencyType, session){
    var url ='https://api.fixer.io/latest';
    rest.getXRate(url,session,currencyType,displayXRate);
}

function displayXRate(message,currencyType,session) {
    var container = [];
    var table = JSON.parse(message);

        var base = table.base;
        var date = table.date;
        var test = JSON.stringify(table.rates);
        var con = test.split(',').join("<br/>");
        container.push("base: " + base + "<br/>" + "date: " + date + "<br/>" + con);

    session.send(container);
}