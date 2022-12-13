# bls-cli

Installation

```
npm i -g git+ssh://github.com/kidd19850824/bls-cli.git#master
```

please check if you have SoftChef's github access key in your .ssh


### Help
```
bls help
```

or 

```
bls <command> help
```

### Utility
| Command | Short | Description |
|---------|:-----:|:------------|
| initialize | init | Initialize your develop environment |
| dynamodb | ddb | Start local DynamoDB |
| layers | lls | List all layers in current region |
| clear-projects | cps | Delete all of dependcy files |
| clear-logs | cls | Delete Lambda logs on AWS CloudWatchLogs in current region. |
| show-config | sc | Display MIAP Config |
| reset-config | rc | Reset MIAP config |
| update-self |  | Update MIAP CLI |
| reset | reset | Reset MIAP config |
| version |  | Display MIAP CLI version |

### Operation
| Command | Short | Description |
|---------|:-----:|:------------|
| package-apps | ap | Package your application, -m {module} |
| deploy-apps | ad | Deploy your application, -m {module} |
| test-apps | at | Test your application, -m {module} |

### Development
| Command | Short | Description |
|---------|:-----:|:------------|
| start-client | client | Start your client, -m {module} |
| invoke-lambda | invoke | Invoke your Lambda in locally, -m {module} -f {function} |
