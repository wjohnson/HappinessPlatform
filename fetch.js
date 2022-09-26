let questionPosition = -1;
let currentResponses = {}

// UI
function clearChat(){
   console.log("Attempting to clear the chat");
   var chatElements = document.getElementsByClassName("message-pair");
   console.log("There are "+chatElements.length+" message pair elements");
   for (let i = (chatElements.length-1); i >= 0; i--) {
      chatElements[i].remove();
    }
}

function makeConsoleElement(consoleMessage){
   var ranAt = Date(Date.now())
   var consoleParagraph = document.createElement('p');
      consoleParagraph.className = 'console-message';
      consoleParagraph.innerHTML = ranAt.toString() + ": " + consoleMessage;
   return consoleParagraph;
}

function makeChatElement(botMessage, userMessage){
   var botParagraph = document.createElement('p');
       botParagraph.className = 'bot';
       botParagraph.innerHTML = botMessage;
   var userParagraph = document.createElement('p');
       userParagraph.className = 'user';
       userParagraph.innerHTML = userMessage;
   
   var section = document.createElement('section');
       section.className = 'message-pair';
       section.appendChild(botParagraph)
       section.appendChild(userParagraph)
   
   return section;
}

function insertConsole(node){}

// MAIN

async function getMessage(){
   console.log("Getting New Message");
   var startingIdFormInput = document.getElementById("startfrom")
   var sessionId = startingIdFormInput.value;
   questionPosition += 1;

   if ("next" in currentResponses){
      console.log("Updating next with "+currentResponses.next);
      sessionId = currentResponses.next;
   }

   if (sessionId === "" || Number(questionPosition) > 4){
      console.log("Requesting New Session");
      await getSession(sessionId);
      questionPosition = 0;
      startingIdFormInput.value = sessionId;

      if ("next" in currentResponses){
         console.log("Updating next with "+currentResponses.next);
         sessionId = currentResponses.next;
         startingIdFormInput.innerHTML = sessionId;
      }

      
      // Clear messages
      clearChat();
      // Clear console
   }

   
   // Display message
   var chatElement = document.getElementById("chat")
   var resp = currentResponses["response"][questionPosition]

   var messageElement = makeChatElement(resp[0], resp[1])
   
   chatElement.insertBefore(messageElement, chatElement.firstChild);
   // Call task API
   // Display console
   
}

// Get Session Data from Server
async function getSession(sessionId="0001") {
   var localSessionId = sessionId;
   if (localSessionId === ""){
      console.log("getSession: Using Default session id");
      localSessionId = "0001";
   }

   await fetch('http://127.0.0.1:5000/session/'+localSessionId,
      {
         method: 'GET',
         headers: {
            'Access-Control-Allow-Origin': '*'
         }
      },
   )
      .then((response) => response.json())
      .then((data) => {
         console.log(data);
         currentResponses = data;
      })
      .catch((err) => {
         console.log(err.message);
      });
} 
// Call REST APIs
function callAzureML(endpoint, key){

}

async function callAzureCogSvc(endpoint, key, message){
   let cogSvcsResponse = {};
   await fetch(endpoint,
      {
         method: 'POST',
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(message)
      },
   )
      .then((response) => response.json())
      .then((data) => {
         console.log(data);
         cogSvcsResponse = data;
      })
      .catch((err) => {
         console.log(err.message);
      });
   return cogSvcsResponse;
}

function callCogSvc(){
   console.log("Calling a Cognitive Service for Sentiment");
   var resp = currentResponses["response"][questionPosition][1];
   
   // Get the first task's endpoint and key
   var task1Endpoint = document.getElementById("task1endpoint").value;
   var task1Key = document.getElementById("task1key").value;
   if (task1Endpoint === "" || task1Key === ""){
      console.error("Task 1 Endpoint or Key is not defined");
      return ;
   }

   payload = {
      documents:[
         {
            id:"01",
            text:resp
         }
      ]
   }
   
   callAzureCogSvc(
      task1Endpoint,
      task1Key,
      payload
   ).then((thing) =>{
      console.log("Cog Services Response:");
      console.log(thing);
      //Get console
      var consoleBody = document.getElementById("console");
      var elem = makeConsoleElement(JSON.stringify(thing, null, 5));
      consoleBody.insertBefore(elem, consoleBody.firstChild);
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
   
}