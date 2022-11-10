let questionPosition = -1;
let currentResponses = {}

// UI
function clearChat() {
   console.log("Attempting to clear the chat");
   var chatElements = document.getElementsByClassName("message-pair");
   console.log("There are " + chatElements.length + " message pair elements");
   for (let i = (chatElements.length - 1); i >= 0; i--) {
      chatElements[i].remove();
   }
}
function clearConsole() {
   console.log("Attempting to clear the console");
   var chatElements = document.getElementsByClassName("console-message");
   console.log("There are " + chatElements.length + " console messages");
   for (let i = (chatElements.length - 1); i >= 0; i--) {
      chatElements[i].remove();
   }
}

function makeConsoleElement(consoleMessage, isError = false) {
   var ranAt = Date(Date.now())
   var consoleParagraph = document.createElement('p');
   consoleParagraph.className = 'console-message';
   consoleParagraph.innerHTML = ranAt.toString() + ": " + consoleMessage;
   if (isError) {
      consoleParagraph.classList.add('console-error');
   }
   return consoleParagraph;
}

function makeChatElement(botMessage, userMessage) {
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

function insertConsole(node) { }

// MAIN

async function getMessage() {
   console.log("Getting New Message");
   var startingIdFormInput = document.getElementById("startfrom")
   var sessionId = startingIdFormInput.value;
   questionPosition += 1;

   if ("next" in currentResponses) {
      console.log("Updating next with " + currentResponses.next);
      sessionId = currentResponses.next;
   }

   if (sessionId === "" || Number(questionPosition) > 4) {
      console.log("Requesting New Session");
      await getSession(sessionId);
      questionPosition = 0;
      startingIdFormInput.value = sessionId;

      if ("next" in currentResponses) {
         console.log("Updating next with " + currentResponses.next);
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
async function getSession(sessionId = "0001") {
   var localSessionId = sessionId;
   if (localSessionId === "") {
      console.log("getSession: Using Default session id");
      localSessionId = "0001";
   }
   var chatbotEndpoint = document.getElementById("chatbotendpoint").value;
   _url = new URL(chatbotEndpoint);
   console.log(localSessionId)
   _url.searchParams.set('session', localSessionId);
   console.log("Using this URL: "+ _url.toString());

   await fetch(_url.toString(),
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
async function callAzureCogSvc(endpoint, key, payload) {
   let finalResponse = {};

   await fetch(endpoint,
      {
         method: 'POST',
         headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
      },
   )
      .then((response) => response.json())
      .then((cogSvcResponse) => {
         var consoleBody = document.getElementById("console");
         let isCogSvcError = false;
         if ("error" in cogSvcResponse) {
            isCogSvcError = true;
         }
         var elem = makeConsoleElement(JSON.stringify(cogSvcResponse), isCogSvcError);
         finalResponse = cogSvcResponse;
         consoleBody.insertBefore(elem, consoleBody.firstChild);
      })
      .catch((err) => {
         console.log(err.message);
      });
   return finalResponse;
}


async function callMysteryApi(endpoint, key, message) {
   let mysteryResponse = {};

   await fetch(endpoint+"?code="+key,
      {
         method: 'POST',
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(message)
      },
   )
      .then((response) => response.json())
      .then((mysteryResponse) => {
         var consoleBody = document.getElementById("console");
         var elem = makeConsoleElement(JSON.stringify(mysteryResponse), false);
         consoleBody.insertBefore(elem, consoleBody.firstChild);
      })
      .catch((err) => {
         console.log(err.message);
      });
   return mysteryResponse;
}

async function callAzureMlSvc(endpoint, key, deployment, message) {
   let azMlResponse = {};
   let rawResponse = null;
   await fetch(endpoint,
      {
         method: 'POST',
         headers: {
            //'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer '+key,
            'Content-Type': 'application/json',
            'azureml-model-deployment': deployment
         },
         body: JSON.stringify(message)
      },
   )
      .then((response) => response.json())
      .then((amlResponse) => {
         var consoleBody = document.getElementById("console");
         let isAmlError = false;
         if ("error" in amlResponse) {
            isAmlError = true;
         }
         var elem = makeConsoleElement(JSON.stringify(amlResponse), isAmlError);
         azMlResponse = amlResponse;
         consoleBody.insertBefore(elem, consoleBody.firstChild);
      })
      .catch((err) => {
         console.log(err.message);
      });
   return azMlResponse;
}

function task1ApiCall() {
   console.log("Calling a Cognitive Service for Sentiment");
   var resp = currentResponses["response"][questionPosition][1];

   // Get the first task's endpoint and key
   var task1Endpoint = document.getElementById("task1endpoint").value;
   var task1Key = document.getElementById("task1key").value;
   var task1Kind = document.getElementById("task1kind").value;
   if (task1Endpoint === "" || task1Key === "" || task1Kind === "") {
      console.error("Task 1 Endpoint, Key, or Kind is not defined");
      return;
   }

   payload = {
      kind: task1Kind,
      analysisInput: {
         documents: [
            {
               id: "01",
               text: resp,
               language: "en"
            }
         ]
      }
   }

   callAzureCogSvc(
      task1Endpoint,
      task1Key,
      payload
   ).then((cogSvcResponse) => {
      console.log("Successful call for task 1 API");
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
}

function task2ApiCall() {
   var resp = currentResponses["response"][questionPosition][1];

   // Get the first task's endpoint and key
   var task2Endpoint = document.getElementById("task2endpoint").value;
   var task2Key = document.getElementById("task2key").value;
   var task2Kind = document.getElementById("task2kind").value;
   if (task2Endpoint === "" || task2Key === "" || task2Kind === "") {
      console.error("Task 2 Endpoint, Key, or Kind is not defined");
      return;
   }

   payload = {
      kind: task2Kind,
      analysisInput: {
         documents: [
            {
               id: "01",
               text: resp,
               language: "en"
            }
         ]
      }
   }

   callAzureCogSvc(
      task2Endpoint,
      task2Key,
      payload,
      "EntityRecognition"
   ).then((cogSvcResponse) => {
      console.log("Successful call for task 2 API");
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
}

function task3ApiCall(){
   console.log("Calling an Azure ML Model");
   var resp = currentResponses["response"][questionPosition][1];

   // Get the first task's endpoint and key
   var task3Endpoint = document.getElementById("task3endpoint").value;
   var task3Deployment = document.getElementById("task3deployment").value;
   var task3Key = document.getElementById("task3key").value;
   if (task3Endpoint === "" || task3Deployment === "" || task3Key === "") {
      console.error("Task 3 Endpoint or Key is not defined");
      return;
   }

   payload = {
      input_data: [
         [
            resp
         ]
      ]
   }

   callAzureMlSvc(
      task3Endpoint,
      task3Key,
      task3Deployment,
      payload
   ).then((amlResponse) => {
      console.log("Successful call for task 1 API");
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
}

function mystery1ApiCall() {
   var resp = currentResponses["response"][questionPosition][1];

   // Get the first task's endpoint and key
   var mystery1Endpoint = document.getElementById("mystery1endpoint").value;
   var mystery1Key = document.getElementById("mystery1key").value;
   var mystery1Version = document.getElementById("mystery1version").value;
   if (mystery1Endpoint === "" || mystery1Key === "" || mystery1Version === "") {
      console.error("Mystery 1 Endpoint or Key or Version is not defined");
      return;
   }

   payload = {
      kind: "EntityRecognition",
      analysisInput: {
         documents: [
            {
               id: "01",
               text: resp,
               language: "en"
            }
         ]
      },
      parameters: {
         modelVersion: mystery1Version
      }
   }

   callAzureCogSvc(
      mystery1Endpoint,
      mystery1Key,
      payload,
      "EntityRecognition"
   ).then((cogSvcResponse) => {
      console.log("Successful call for mystery API");
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
}


function mystery2ApiCall() {
   var resp = currentResponses["response"][questionPosition][1];

   var mystery2Endpoint = document.getElementById("mystery2endpoint").value;
   var mystery2Key = document.getElementById("mystery2key").value;

   if (mystery2Endpoint === "" || mystery2Key === "") {
      console.error("Mystery 2 Endpoint or Key is not defined");
      return;
   }

   payload = {
      input_data: [
         [resp]
      ]
   }

   callMysteryApi(
      mystery2Endpoint,
      mystery2Key,
      payload
   ).then((mysteryResponse) => {
      console.log("Successful call for mystery 2 API");
   }).catch((err) => {
      console.log("Cog Service Error:")
      console.log(err);
   });
}
