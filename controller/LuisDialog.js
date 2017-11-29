var builder = require('botbuilder');
var bank = require('./Functions');
var customVision = require('./CustomVision');
var XRate = require('./XRate');


exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d4fb21ff-cc42-4648-aa2c-3eb1583eed48?subscription-key=1ba63520afe24644bc75129d6f89e19c&verbose=true&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('GetBalance', [
        function (session, args, next) {
            session.dialogData.args = args || {};        
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter your username to view the funds on your account.");                
            } else {
                next(); // Skip if we already have this info.
            }
        },
        function (session, results, next) {
            if (!isAttachment(session)) {

                if (results.response) {
                    session.conversationData["username"] = results.response;
                }
                
                session.send("Retrieving your funds...");
                bank.displayBalance(session, session.conversationData["username"]);  
            }
        }

    ]).triggerAction({
        matches: 'GetBalance'
    });

    bot.dialog('WelcomeIntent', [
        function(session, next){
            session.send("Welcome to Credbot!")
            session.send("The purpose of this bot is to help you manage your bank related activities remotely, swiftly, and efficiently.")
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Please tell me your username to start using my services:");
            } else {
                next();
            }

        },
        
        function (session, results, next){
            if (results.response) {
                session.conversationData["username"] = results.response;
                session.send(`Hello ${results.response}!`); 
            }
           
            session.send("Below is a list of the current services that I can perform for you:\n 1. If you want to view your balance or funds, ***type show, display or view balance/funds*** \n 2. If you want to add a new payment card to your account ***type add (cardtype) to (accountype)*** \n 3. If you want to cancel an existing payment card ***type cancel (cardtype)*** \n 4. If you want to view the exchange rate ***type show exchange rate*** \n 5. If you want to use Bravil bank's custom vision service to determine whether a link represents a coin or a particular type of note then just ***send me a link ('Make sure you use https')***")
        }

    ]).triggerAction({
        matches: 'WelcomeIntent'
    });

    bot.dialog('AddCard', [
        function (session, args, next) {
            if (!isAttachment(session)) {
                session.dialogData.args = args || {};        
                if (!session.conversationData["username"]) { //Check if conversation has username
                    builder.Prompts.text(session, "Please enter your ***username*** to use my services");                
                } else {
                    next(); // Skip if we already have this info.
                }
            }
        },
        function (session, results, next) {
            if (!isAttachment(session)) {
    
                    if (results.response) {
                        session.conversationData["username"] = results.response;
                    }
                    // Pulls out the card entity from the session if it exists
                    var cardEntity = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'card');
                    var linkEntity = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'link');
        
                    // Checks if the card entity was found
                    if (cardEntity && linkEntity) {
                        session.send("Adding card to account...");
                        session.send("All done!"); 
                        session.send('A new ***\%s\*** card has been opened for your ***\%s\*** account.', cardEntity.entity, linkEntity.entity);
                        bank.sendCard(session, session.conversationData["username"], cardEntity.entity, linkEntity.entity); 
        
                    } else {
                        session.send("No such card identified!");
                    }
                }
            }
      
    ]).triggerAction({
        matches: 'AddCard'
    });


    bot.dialog('CancelCard', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session,"Please enter your ***username*** to use my services");
            } else {
                next(); // Skip if we already have this info.
            }
        },

        function(session, next){
            if (!session.conversationData["yes" || "no"]) {
                session.send("***WARNING*** This action ***CANNOT*** be undone once issued so be sure that this is what you want!");
                builder.Prompts.confirm(session, "Are you sure you wish to cancel your card? Type 'Yes' to continue.");
            } else {
                next();
            }
        },

        function (session, results, next) {
            if (!isAttachment(session)) {    
                if (results.response) {
                    session.conversationData["yes"] = results.response;
                    next();
                } else {
                    session.send("Card was not cancelled");
                }
            }
        },

        function (session, results, next){
            if (results.response) {
                session.conversationData["username"] = results.response;
  
            }
            // Pulls out the Card entity from the session if it exists
            var cardEntity = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'card');

            // Checks if the for entity was found
            
            if (cardEntity) {
                session.send("Cancelling card..");
                session.send('Your ***\%s\*** has been succesfully ***canceled***.', cardEntity.entity);
                bank.deleteCard(session,session.conversationData['username'],cardEntity.entity); 
            } else {
                session.send("Oops looks like no such card exists on your account! Please make sure that you have typed in your card correctly!");
            }
        }
    ]).triggerAction({
        matches: 'CancelCard'
    });

    bot.dialog('GetRate', function (session, args) {
            
        if (!isAttachment(session)) {
                
            // Pulls out the rate entity from the session if it exists
            var rateEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'rate');
                
            // Checks if the rate entity was found
            
            if (rateEntity) {
                session.send('Getting exchange rates...', rateEntity.entity);
                XRate.displayXRate(rateEntity.entity, session);
                
            } else {
                session.send("Can't identify rate! Please try again");
            }
        }
        
    }).triggerAction({
        matches: 'GetRate'
    });
    
}

function isAttachment(session) { 
    var msg = session.message.text;
    if (msg.includes("http")) {
        //call custom vision
        customVision.retreiveMessageHttps(session);

        return true;
    }
    else {
        return false;
    }
}