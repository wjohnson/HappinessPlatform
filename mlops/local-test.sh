MODEL_VERSION=1
MODEL_NAME=custom-sentiment-model
ENDPOINT_NAME=chatbot-service-endpoint
DEPLOYMENT_NAME=sentiment-deployment

# TODO: Update
WORKSPACE=<WORKSPACE_NAME>
RESOURCE_GROUP=<RESOURCE_GROUP_NAME>

# Run Azure login
# az login

# Configure default values
az configure --defaults workspace=$WORKSPACE group=$RESOURCE_GROUP

# Assuming the model is registered
az ml online-endpoint update -f ./mlops/custom-endpoint.yml --set name=$ENDPOINT_NAME

# Assuming the 
DEPLOYMENT_EXISTS=$(az ml online-deployment list --endpoint-name $ENDPOINT_NAME | jq -r '.[].name' | grep "^$DEPLOYMENT_NAME$")
EXISTING_MODEL_STRING="azureml:$MODEL_NAME:$MODEL_VERSION"
if [ -z ${DEPLOYMENT_EXISTS} ]; 
then
    az ml online-deployment update -f ./mlops/custom-deployment.yml --name $DEPLOYMENT_NAME --endpoint-name $ENDPOINT_NAME --set model=$EXISTING_MODEL_STRING
    az ml online-endpoint update --name $ENDPOINT_NAME --traffic "$DEPLOYMENT_NAME=100"
else
    az ml online-deployment create -f ./mlops/custom-deployment.yml --name $DEPLOYMENT_NAME --endpoint-name $ENDPOINT_NAME --set model=$EXISTING_MODEL_STRING --all-traffic
fi