## 404 checker
This is a node script that crawls an array of URL´s, to check the status response of each URL. 
Once all the URL´s has been checked, it will send an email with the results, to a specified email recipient. 

### Usage
The script can be run with npm start - or it can be deployed to an Azure Functions App, using the Azure CLI. 
This App is set up to run inside an Azure function, with a timed trigger that runs once per day. This can be configured using a CRON job. 
Please reference the Azure documentation to deploy the app to Azure. 


### Resources
- [Sendgrid.com](https://wwww.sendgrid.com)
- [Azure Functions APP](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview)
- [Nodemailer](https://nodemailer.com/about/)
- [Axios](https://axios-http.com/)