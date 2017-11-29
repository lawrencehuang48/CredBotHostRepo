var request = require('request'); //node module for http post requests

exports.retreiveMessageHttps = function (session){

    request.post({
        url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/08824aa5-4a43-4502-93ff-161575952074/url?iterationId=c5cc7947-f123-4824-8f34-b06ea93fcb27',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Prediction-Key': 'e255f72dcb9b4f69917f05309ab246d2'
        },
        body: { 'Url': session.message.text }
    }, function(error, response, body){
        console.log(validResponse(body));
        session.send(validResponse(body));
    });
}

function validResponse(body){
    if (body && body.Predictions && body.Predictions[0].Tag){
        return "Thank you for using Bank of Bravil's custom vision service! The linked image represents a " + body.Predictions[0].Tag + "."
    } else{
        console.log('Oops, please try again!');
    }
}