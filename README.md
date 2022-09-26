<<<<<<< HEAD
# HappinessPlatform
A platform for measuring the end user's happiness
=======
# Happiness Platform

The Happiness Platform is a chat application that helps you keep track of your happiness.

The questions asked are based on the [Happiness Inventory](https://archive.ics.uci.edu/ml/datasets/Sentiment+Labelled+Sentences#). This dev environment simulates five happiness questions that you can run machine learning models against.

## Happiness Questions
* At work or school this week, what did you notice around you?
* What's an activity you're interested in right now and why do you like it?
* Tell me about a friend you connected with this week?
* Tell me about an activity you did that you're proud of this week?
* What are your plans for next week?

## Machine Learning

The admin panel provides input boxes for API endpoints and their respective keys. Each time a message is retrieved, it will execute a call against the provided endpoint with the user's response to the latest question.

### Training Dataset

While you could use any labelled set of sentences, an easy to use one is [Sentiment Labelled Sentences](https://archive.ics.uci.edu/ml/datasets/Sentiment+Labelled+Sentences#) to train a custom sentiment analysis model.

>>>>>>> 6d1ae5f (Prototype)
