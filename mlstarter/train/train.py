# Source https://github.com/Azure/azureml-examples/blob/sdk-preview/cli/jobs/pipelines-with-components/pipeline_with_hyperparameter_sweep/train-src/train.py

# imports
import os
import mlflow
import argparse

import pandas as pd
from pathlib import Path

from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

from distutils.dir_util import copy_tree


def main(args):
    # enable auto logging
    mlflow.autolog()

    # read in data
    df = pd.read_csv(Path(args.data), sep="\t")
    df.columns=["body", "sensitivity"]
    print(df.head())

    X = df.drop(["sensitivity"], axis=1)
    y = df["sensitivity"]

    X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=args.random_state
        )
    print(X_train.size)
    print(y_train.size)
    print(X_test.size)
    print(y_test.size)
    
    model = DecisionTreeClassifier()
    pipe = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('model', model)
        ]
    )
    pipe.fit(X_train["body"].values.tolist(), y_train)
    
    from sklearn.metrics import classification_report
    prediction = pipe.predict(X_test["body"].values.tolist())
    report = classification_report(y_test, prediction)
    print(report)
    
    mlflow.sklearn.save_model(pipe, "model")

    # copy subdirectory example
    from_directory = "model"
    to_directory = args.model_output

    copy_tree(from_directory, to_directory)


def parse_args():
    # setup arg parser
    parser = argparse.ArgumentParser()

    # add arguments
    parser.add_argument("--data", type=str, help="Path of the training data")
    parser.add_argument("--random_state", type=int, default=42, help="The random seed")
    parser.add_argument("--model_output", type=str, help="Path of output model")
    


    # parse args
    args = parser.parse_args()

    # return args
    return args


# run script
if __name__ == "__main__":
    # parse args
    args = parse_args()

    # run main function
    main(args)