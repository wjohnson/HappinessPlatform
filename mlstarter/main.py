# Helpful Link: https://learn.microsoft.com/en-us/azure/machine-learning/tutorial-azure-ml-in-a-day#configure-the-command

from azure.identity import DefaultAzureCredential, InteractiveBrowserCredential # Convenient classes for authenticating to Azure

from azure.ai.ml import MLClient # Connect to Azure ML workspace
from azure.ai.ml.entities import AmlCompute # Connect to a Compute engine
from azure.ai.ml import command
from azure.ai.ml import Input


if __name__ == "__main__":

    try:
        credential = DefaultAzureCredential()
        # Check if given credential can get token successfully.
        credential.get_token("https://management.azure.com/.default")
    except Exception as ex:
        # Fall back to InteractiveBrowserCredential in case DefaultAzureCredential does not work
        credential = InteractiveBrowserCredential()
    
    # TODO: Update configurations with your Azure ML Workspace Information
    ml_client = MLClient(
        workspace_name="<AML_WORKSPACE_NAME>",
        resource_group_name="<RESOURCE_GROUP>",
        subscription_id="<SUBSCRIPTION_ID>",
        credential=credential,
    )

    cpu_compute_target = "cpu-cluster"

    try:
        # let's see if the compute target already exists
        cpu_cluster = ml_client.compute.get(cpu_compute_target)
        print(
            f"You already have a cluster named {cpu_compute_target}, we'll reuse it as is."
        )

    except Exception:
        print("Creating a new cpu compute target...")

        # Let's create the Azure ML compute object with the intended parameters
        cpu_cluster = AmlCompute(
            # Name assigned to the compute cluster
            name=cpu_compute_target,
            # Azure ML Compute is the on-demand VM service
            type="amlcompute",
            # VM Family
            size="STANDARD_DS3_V2",
            # Minimum running nodes when there is no job running
            min_instances=0,
            # Nodes in cluster
            max_instances=2,
            # How many seconds will the node running after the job termination
            idle_time_before_scale_down=180,
            # Dedicated or LowPriority. The latter is cheaper but there is a chance of job termination
            tier="LowPriority",
        )

        # Now, we pass the object to MLClient's create_or_update method
        # We have to wait for the compute to be available
        cpu_cluster_polling = ml_client.begin_create_or_update(cpu_cluster)
        retry_count = 0
        while ((not cpu_cluster_polling.done()) and (retry_count < 10)):
            print("Polling for cluster creation...")
            cpu_cluster_polling.wait(60)
            retry_count += 1
        
        if cpu_cluster_polling.done():
            cpu_cluster = ml_client.compute.get(cpu_compute_target)
        else:
            raise RuntimeError("The cluster was not created in the allowed amount of time")

    print(
        f"AMLCompute with name {cpu_cluster.name} is created, the compute size is {cpu_cluster.size}"
    )

    job = command(
        inputs=dict(
            data=Input(
                # uri_file lets us treat our dataset as if it were another file on the file system
                type="uri_file",
                # TODO: Path should be updated the naming convention you used such as UI/2022-11-10_062206_UTC/imdb_labelled.txt
                path="azureml://datastores/workspaceblobstore/paths/UI/2022-11-10_062206_UTC/imdb_labelled.txt",
            )
        ),
        # location of source code in your local directory
        # this will upload all contents in the directory you provide
        code="./mlstarter/train",  
        # command is a string that represents the cli commands you would execute
        command="python train.py --data ${{inputs.data}} --model_output model",
        # List of available environments: https://learn.microsoft.com/en-us/azure/machine-learning/resource-curated-environments
        environment="AzureML-sklearn-1.0-ubuntu20.04-py38-cpu@latest",
        compute=cpu_compute_target,
        experiment_name="sentiment_analysis",
        display_name="sentiment_analysis_hack",
    )

    response = ml_client.create_or_update(job)
    print(response)
