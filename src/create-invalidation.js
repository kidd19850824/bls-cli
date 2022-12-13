'use strict'

const { CloudFront } = require('aws-sdk')
const { log } = require('./common')
const { confirmPrompt, selectCloudFrontDistributionPrompt } = require('./prompts')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Create CloudFront distribution')
        return true
    }
    try {
        const cloudFrontClient = new CloudFront()
        const listDistributions = await cloudFrontClient.listDistributions().promise()
        const distributions = listDistributions.DistributionList.Items.map(item => {
            return {
                value: {
                    id: item.Id
                },
                name: item.Aliases.Items
            }
        })
        const selectedDistributionName = argv.s || false
        const selectedDistributionItem = distributions.find(v => v.name[0] === selectedDistributionName)
        let selectedDistribution
        let confirmed
        if (selectedDistributionItem) {
            selectedDistribution = {
                distribution: {
                    id: selectedDistributionItem.value.id
                }
            }
            confirmed = {
                answer: 'Yes'
            }
        } else {
            selectedDistribution = await selectCloudFrontDistributionPrompt(distributions)
            confirmed = await confirmPrompt()
        }
        if (confirmed.answer === 'Yes') {
            const created = await cloudFrontClient.createInvalidation({
                DistributionId: selectedDistribution.distribution.id,
                InvalidationBatch: {
                    CallerReference: `${Date.now()}`,
                    Paths: {
                        Quantity: 1,
                        Items: ['/*']
                    }
                }
            }).promise()
            console.log(created)
        } else {
            log.success('Cancel')
        }
    } catch (error) {
        log.error(error)
    }
}
