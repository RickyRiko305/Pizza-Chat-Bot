// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://pizza-bot-tecbyq.firebaseio.com/'
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }


  // Run the proper function handler based on the matched Dialogflow intent name
  function handleOrder(agent){

    const size = agent.parameters.size[0];
    const topping = agent.parameters.topping[0];
    const crust = agent.parameters.crust[0];
    const sauce = agent.parameters.sauce[0];
    const address = agent.parameters.address[0];
    const phone = agent.parameters.phone[0];
    const type = agent.parameters.type[0];

    return admin.database().ref('data').push({
      address: address,
      crust: crust,
      phone: phone,
      sauce: sauce,
      size: size,
      topping: topping,
      type: type,
      status: 'pending'

    });
  }
  //var number;
  var s;
  function handleStatus(agent){
    const ref = admin.database().ref('data');
    const number = agent.parameters.phone;

    ref.on("value", function(snapshot) {
      	var values = snapshot.val();
    	var keys = Object.keys(values);

    	for(var i = 0; i<keys.length; i++){
      		var k = keys[i];
      		var contact = values[k].phone;
      		var status = values[k].status;
      		s = status;

      		console.log(contact,status,number);
      		if(contact === number){
              console.log('inside the loop');
              agent.add(`your order is ${status}`);
              break;
            }
    	}

  		console.log(snapshot.val());
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});


  }

  function gotData(data){
    var values = data.val();
    var keys = Object.keys(values);

    for(var i = 0; i<keys.length; i++){
      var k = keys[i];
      var contact = values[k].phone;
      var status = values[k].status;
      s = status;
      console.log(contact,status);

      return status;
    }
  }

  function errData(err){
    console.log('Error!');
    console.log(err);
  }

  

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Order', handleOrder);
  intentMap.set('Status', handleStatus);
  agent.handleRequest(intentMap);
});
