from __future__ import annotations
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

#make sure you have azure-ai-textanalytics==5.2.0 otherwise pip install it

#get the Azure Language Model (or Congtive Service Multimodel) key and endpoint from Azure portal
key = "Enter your Cognitive Services Key here"
endpoint = "Enter your Cognitive Services endpoint here"

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

# Authenticate the client using your key and endpoint 
def authenticate_client():
    ta_credential = AzureKeyCredential(key)
    text_analytics_client = TextAnalyticsClient(
            endpoint=endpoint, 
            credential=ta_credential)
    return text_analytics_client

client = authenticate_client()

# Example function for recognizing entities from text
def entity_recognition_example(client):

    try:
        documents = [
        """I work for Foo Company, and we hired Contoso for our annual founding ceremony. The food
        was amazing and we all can't say enough good words about the quality and the level of service.""",
        """We at the Foo Company re-hired Contoso after all of our past successes with the company.
        Though the food was still great, I feel there has been a quality drop since their last time
        catering for us. Is anyone else running into the same problem?""",
        """Bar Company is over the moon about the service we received from Contoso, the best sliders ever!!!!"""
        ]
        result = client.recognize_entities(documents = documents)[0]

        print("Named Entities:\n")
        for entity in result.entities:
            print("\tText: \t", entity.text, "\tCategory: \t", entity.category, "\tSubCategory: \t", entity.subcategory,
                    "\n\tConfidence Score: \t", round(entity.confidence_score, 2), "\tLength: \t", entity.length, "\tOffset: \t", entity.offset, "\n")

    except Exception as err:
        print("Encountered exception. {}".format(err))
entity_recognition_example(client)