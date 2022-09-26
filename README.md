# Happiness Platform

The Happiness Platform is a chat application that helps you keep track of your happiness.

The questions asked are based on the [Happiness Inventory](https://archive.ics.uci.edu/ml/datasets/Sentiment+Labelled+Sentences#). This dev environment simulates five happiness questions that you can run machine learning models against.

## Happiness Questions
* At work or school this week, what did you notice around you?
* What's an activity you're interested in right now and why do you like it?
* Tell me about a friend you connected with this week?
* Tell me about an activity you did that you're proud of this week?
* What are your plans for next week?

## Tasks

The following tasks should be completed during the hackathon. You'll be using or designing a machine learning API for each task. You'll need to provide the API endpoint and the API key for the User Interface to send each chat message to the API.

1. Provision a [Sentiment Analysis Service](https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/sentiment-opinion-mining/overview)
2. Use the same provisioned service to implement a [Named Entity Recognition Service](https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/named-entity-recognition/overview)
3. Provision an Azure Machine Learning Service, train a model to analyze the sentiment, and deploy the model.
    * To train this model, please use the [Sentiment Labelled Sentences Data](https://archive.ics.uci.edu/ml/datasets/Sentiment+Labelled+Sentences#).
    * You might use the [Azure Machine Learning Designer](https://learn.microsoft.com/en-us/azure/machine-learning/concept-designer)
    * You might use the [Azure Automated Machine Learning Service](https://learn.microsoft.com/en-us/azure/machine-learning/concept-automated-ml)
    * You might [submit a `command()`](https://learn.microsoft.com/en-us/azure/machine-learning/concept-train-machine-learning-model#submit-a-command) to a compute cluster.
    * You might use an [Interactive Notebook in the cloud](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-run-jupyter-notebooks) to do your training.

### Mystery Tasks

Throughout the hackathon there will be mystery / surprise tasks.

Expand the `Additional Tasks` section to plug in values for the mystery tasks when they've been announced and you've been able to complete the task.

## Machine Learning

The admin panel provides input boxes for API endpoints and their respective keys. Each time a message is retrieved, it will execute a call against the provided endpoint with the user's response to the latest question.

### Training Dataset

For task #3, you must train a custom machine learning model. While you could use any labelled set of sentences, an easy to use one is [Sentiment Labelled Sentences](https://archive.ics.uci.edu/ml/datasets/Sentiment+Labelled+Sentences#) to train a custom sentiment analysis model.
