var rest = require('../Restclient');

exports.displayBalance = function getBalance(session, username){
    var url = 'https://CredBot.azurewebsites.net/tables/CredBot';
    rest.getBalance(url, session, username, handleDisplayFundsResponse)
};

exports.sendCard = function addCardToAccount(session, username, cardtype, linkedto){ 
    var url = 'https://CredBot.azurewebsites.net/tables/CredBot';
    rest.addCardToAccount(url, username, cardtype, linkedto)
};

function handleDisplayFundsResponse(message, session, username) {
    var table = JSON.parse(message);
    var allAccounts = [];
    for (var column in table) {
        var usernameReceived = table[column].username;
        var balance = table[column].balance;
        var account = table[column].account;
        var cardtype = table[column].cardtype;

        //Convert to lower case whilst doing comparison to ensure the user can type whatever they like
        if (username.toLowerCase() === usernameReceived.toLowerCase() && !cardtype) {
            if(table.length - 1) {
                allAccounts.push("***" + account + "***" + ":\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + balance + "<br/>");
                
            }
            else {
                allAccounts.push(balance);
            }
        }        
    }
    var output = allAccounts.join(" ");
    
    // Print out the balance of all the user's current bank accounts
    session.send("%s, your account balance is: <br/> %s", username, output,);             
    
}

exports.deleteCard = function deleteCard(session,username, cardtype){ 
    var url  = 'https://CredBot.azurewebsites.net/tables/CredBot';


    rest.getBalance(url,session, username,function(message,session,username){ //Callback function
     var   allAccounts = JSON.parse(message); //Parse result as JSON

        for(var i in allAccounts) { //Iterate through columns in easy table

            //Check if card type and username match
            if (allAccounts[i].cardtype === cardtype && allAccounts[i].username === username) {

                console.log(allAccounts[i]);
                
                //Delete the card
                rest.deleteCard(url,session,username,cardtype, allAccounts[i].id ,handleDeletedCard)

            }
        }


    });


};

function handleDeletedCard(body,session,username,cardtype){
    console.log('Done');
}

