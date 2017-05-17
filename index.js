'use strict';

var stateToCapital = {
    "Alabama": "Montgomery",
    "Alaska": "Juneau",
    "Arizona":	"Phoenix",
    "Arkansas":	"Little Rock",
    "California": "Sacramento",
    "Colorado": "Denver",
    "Connecticut": "Hartford",
    "Delaware": "Dover",
    "Florida": "Tallahassee",
    "Georgia": "Atlanta",
    "Hawaii": "Honolulu",
    "Idaho": "Boise",
    "Illinois": "Springfield",
    "Indiana": "Indianapolis",
    "Iowa": "Des Moines",
    "Kansas": "Topeka",
    "Kentucky": "Frankfort",
    "Louisiana": "Baton Rouge",
    "Maine": "Augusta",
    "Maryland":	"Annapolis",
    "Massachusetts": "Boston",
    "Michigan": "Lansing",
    "Minnesota": "St. Paul",
    "Mississippi": "Jackson",
    "Missouri": "Jefferson City",
    "Montana":	"Helena",
    "Nebraska": "Lincoln",
    "Nevada": "Carson City",
    "New Hampshire": "Concord",
    "New Jersey": "Trenton",
    "New Mexico": "Santa Fe",
    "New York":  "Albany",  
    "North Carolina": "Raleigh",
    "North Dakota":	"Bismarck",
    "Ohio":  "Columbus",
    "Oklahoma":  "Oklahoma City",
    "Oregon": "Salem",
    "Pennsylvania":  "Harrisburg",
    "Rhode Island": "Providence",
    "South Carolina": "Columbia",
    "South Dakota": "Pierre",
    "Tennessee": "Nashville",
    "Texas": "Austin",
    "Utah":	"Salt Lake City",
    "Vermont": "Montpelier",
    "Virginia":  "Richmond",
    "Washington": "Olympia",
    "West Virginia": "Charleston",
    "Wisconsin": "Madison",
    "Wyoming": "Cheyenne",
}



function MessageHandler(context, event) {
    context.request = event.message;
    context.sender = event.sender;
    context.simpledb.doGet(event.sender);
}

function createUserState() {
    var reVal = {};
    var states = Object.keys(stateToCapital);
    for(var i = 0;i < states.length;i++) {
        reVal[states[i]] = {
            correct: 0,
            incorrect: 0,
        };
        
    }
    return reVal;
}

/** Functions declared below are required **/
function EventHandler(context, event) {
    if(! context.simpledb.botleveldata.numinstance)
        context.simpledb.botleveldata.numinstance = 0;
    numinstances = parseInt(context.simpledb.botleveldata.numinstance) + 1;
    context.simpledb.botleveldata.numinstance = numinstances;
    context.sendResponse("Thanks for adding me. You are:" + numinstances);
}

function HttpResponseHandler(context, event) {
    // if(event.geturl === "http://ip-api.com/json")
    context.sendResponse(event.getresp);
}

function DbGetHandler(context, event) {

    var databaseValue;
    if(event.dbval != "") {
      databaseValue = JSON.parse(event.dbval);
      var currentState = databaseValue.currentState;
    }

    var randomeState;
        
    if(context.request.toLowerCase().includes("score")) {
        var numberCorrect = countNumberOfCorrectlyAnswered(databaseValue.userState);
        var haveNotYetAnsweredCorrectly = countNumberOfNotCorrectlyAnswered(databaseValue.userState);
        context.sendResponse("You have answered " + numberCorrect + " correctly! "
            + "You have " + haveNotYetAnsweredCorrectly + " left to answer correctly");
    } else if(context.request.toLowerCase().includes("reset")) {
        context.sendResponse("Okay, new quiz. "
            + "What is the state capital for Texas?");
        var userData = {};
        randomState = "Texas";
        databaseValue.userState = createUserState();
    } else if(context.request.toLowerCase().includes("state capital quiz") && databaseValue) {
                    
        randomeState = getRandomStateThatUserHasNotGottenCorrect(databaseValue.userState);

        context.sendResponse("Hi, Welcome back to State Capital Quiz! "
            + "You have already answered " + countNumberOfCorrectlyAnswered(databaseValue.userState) + " correctly. "
            + "What is the state capital for " + randomeState + "?");
        
    } else if(context.request.toLowerCase().includes("state capital quiz")) {
        context.sendResponse("Welcome to State Capital Quiz! "
            + "To play, I will give you a state, you give the capital city. "
            + "See how many you can get right. "
            + "What is the state capital for Texas?");
        var userData = {};
        randomState = "Texas";
        databaseValue = {};
        databaseValue.userState = createUserState();
    } else if (stateToCapital[currentState].toLowerCase().includes(context.request.toLowerCase())) {
        databaseValue.userState[currentState].correct += 1;
        randomState = getRandomStateThatUserHasNotGottenCorrect(databaseValue.userState);
        if (countNumberOfNotCorrectlyAnswered(databaseValue.userState) === 0) {
            randomState = "Texas";
            databaseValue.userState = createUserState();
            context.sendResponse("Correct! Yay! You have finished all 50 states! " 
               + "New Quiz! "
               + "What is the state capital for " +  randomState); 
        } else {
           context.sendResponse("Correct! Yay! " 
               + "The state capital is: " + stateToCapital[currentState] + ". "
               + "What is the state capital for " +  randomState); 
        }
    } else if (context.request.toLowerCase().includes("know")) {
        databaseValue.userState[currentState].incorrect += 1;
        randomState = getRandomStateThatUserHasNotGottenCorrect(databaseValue.userState);
        context.sendResponse("The correct city is: " + stateToCapital[currentState] + ". "
           + "What is the state capital for " +  randomState); 
    } else {
             
       databaseValue.userState[currentState].incorrect += 1;
       randomState = getRandomStateThatUserHasNotGottenCorrect(databaseValue.userState);
       context.sendResponse( "Sorry, that is not the correct city. "
           + "The correct city is: " + stateToCapital[currentState] + ". "
           + "What is the state capital for " +  randomState); 
    }
    databaseValue.currentState = randomState;
    //console.log(JSON.stringify(databaseValue))
    context.simpledb.doPut(context.sender, JSON.stringify(databaseValue));
}

function countNumberOfCorrectlyAnswered(userState) {
    return Object.keys(userState).filter(function(key) {return userState[key].correct !== 0}).length;
}

function countNumberOfIncorrectlyAnswered(userState) {
    return Object.keys(userState).filter(function(key) {return userState[key].incorrect !== 0}).length;
}

function countNumberOfNotCorrectlyAnswered(userState) {
   return Object.keys(userState).length - countNumberOfCorrectlyAnswered(userState);
}

function getRandomStateThatUserHasNotGottenCorrect(userState) {
    var availableStates = Object.keys(userState).filter(function(key) {return userState[key].correct === 0});
    return availableStates[Math.floor(Math.random() * availableStates.length)];
}


function DbPutHandler(context, event) {
}
