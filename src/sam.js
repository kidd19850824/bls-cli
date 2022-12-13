'use strict'

const fs = require('fs')
const YAML = require('yaml')
const { listAllLayers } = require('./lambda')
const { spawn } = require('child_process')
const { log } = require('./common')

const command = 'sam'

const templateResolver = (prefix, name, region, options = {}) => {
    return new Promise(async(resolve, reject) => {
        try {
            log.info(`Start resolve ${name}.yaml`)
            const templateFile = `${prefix}/${name}.resolved.yaml`
            const regexp = /\${BLS::([\w-]*)::([\w-]*)::([\w-]*)}/
            const layerList = await listAllLayers(region)
            let templateContent = fs.readFileSync(`${prefix}/${name}.yaml`).toString()
            const tags = (templateContent.match(new RegExp(regexp, 'g')) || [])
            for (let tag of tags) {
                let type = tag.replace(regexp, '$1')
                let replaceTo = ''
                if (type === 'Layer') {
                    let name = tag.replace(regexp, '$2')
                    let version = tag.replace(regexp, '$3')
                    let layer = layerList[name]
                    if (version <= layer.latest.version) {
                        replaceTo = `${layer.arn}:${version}`
                    } else if (version.toLowerCase() === 'latest') {
                        replaceTo = layer.latest.arn
                    }
                } else if (type === 'Application') {
                    let nestedFileName = tag.replace(regexp, '$3')
                    let nestTemplateFile = await templateResolver(prefix, nestedFileName, region, options)
                    replaceTo = nestTemplateFile
                } else {
                    log.error(`Tag: ${tag} unprocess`)
                }
                templateContent = templateContent.replace(tag, replaceTo)
                log.info(`Replaced ${tag} to ${replaceTo}`)
            }
            // Process ${BLS::DeletionPolicy}
            templateContent = templateContent.replace(new RegExp(/\${BLS::DeletionPolicy}/g), process.env.NODE_ENV === 'production' ? 'Retain' : 'Delete')
            // Process ${BLS::Source}
            templateContent = templateContent.replace(new RegExp(/\${BLS::Source}/g), options.localInvoke ? 'src' : 'dists')
            fs.writeFileSync(templateFile, templateContent)
            resolve(templateFile)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.samPackage = (prefix, region, bucket, bucketPrefix = '') => {
    return new Promise(async(resolve, reject) => {
        try {
            const templateFile = await templateResolver(prefix, 'template', region)
            const args = [
                `package`,
                `--template-file`, `${templateFile}`,
                `--s3-bucket`, bucket,
                `--output-template-file`, `${prefix}/packaged.yaml`
            ]
            if (process.env.AWS_PROFILE) {
                args.push(`--profile`, process.env.AWS_PROFILE)
            }
            if (bucketPrefix) {
                args.push('--s3-prefix', bucketPrefix)
            }
            log.info(command, args.join(' '))
            const sam = spawn(command, args, {
                stdio: 'inherit',
                shell: true
            })
            sam.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(
                        new Error(code)
                    )
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.samPublish = (prefix, region) => {
    return new Promise(async(resolve, reject) => {
        try {
            const args = [
                `publish`,
                `--template`, `${prefix}/packaged.yaml`,
                `--region`, region,
                `--debug`
            ]
            log.info(command, args.join(' '))
            const sam = spawn(command, args, {
                stdio: 'inherit',
                shell: true
            })
            sam.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(
                        new Error(code)
                    )
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.samDeploy = (prefix, stackName, region = null, parameters = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const args = [
                `deploy`,
                `--template-file`, `${prefix}/packaged.yaml`,
                `--stack-name`, stackName,
                `--capabilities`, `CAPABILITY_IAM`, `CAPABILITY_NAMED_IAM`, `CAPABILITY_AUTO_EXPAND`,
                `--debug`
            ]
            if (process.env.AWS_PROFILE) {
                args.push(`--profile`, process.env.AWS_PROFILE)
            }
            if (region) {
                args.push(`--region`, region)
            }
            if (Object.keys(parameters).length > 0) {
                args.push(`--parameter-overrides`)
                for (let key in parameters) {
                    args.push(`${key}=${parameters[key]}`)
                }
            }
            log.info(`Deploy stack name: [${stackName}]`)
            log.info(command, args.join(' '))
            const sam = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
            sam.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(
                        new Error(code)
                    )
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.samLocalStartApi = async(prefix, region, host = '127.0.0.1', port = '3000', templateName = 'template', parameters = {}) => {
    const templateFile = await templateResolver(prefix, templateName, region, {
        localInvoke: true
    })
    const args = [
        `local`, `start-api`,
        `-t`, `${templateFile}`,
        `-n`, `${prefix}/env.json`,
        `--host`, host,
        `-p`, port,
        `--region`, region,
        `--debug`
    ]
    if (process.env.AWS_PROFILE) {
        args.push(`--profile`, process.env.AWS_PROFILE)
    }
    if (Object.keys(parameters).length > 0) {
        let parameterString = ''
        for (let key in parameters) {
            parameterString += `ParameterKey=${key},ParameterValue=${parameters[key]}`
        }
        args.push(`--parameter-overrides`, parameterString)
    }
    log.info(command, args.join(' '))
    spawn(command, args, {
        stdio: 'inherit',
        shell: true
    })
}

module.exports.samLocalInvokeLambda = async(prefix, region, name, templateName = 'template', parameters = []) => {
    const templateFile = await templateResolver(prefix, templateName, region, {
        localInvoke: true
    })
    const template = YAML.parseDocument(
        fs.readFileSync(templateFile, 'utf8')
    ).toJSON()
    let eventPath
    const resourceFunction = template['Resources'][name]
    if (resourceFunction && resourceFunction['Type'] === 'AWS::Serverless::Function') {
        const codeUri = resourceFunction['Properties']['CodeUri']
        eventPath = `${prefix}/${codeUri}/event.json`
        if (!fs.existsSync(eventPath)) {
            eventPath = null
        }
    }
    let args = [
        `local`, `invoke`,
        name,
        `-t`, `${templateFile}`,
        `-n`, `${prefix}/env.json`,
        `--region`, region,
        `--debug`,
        `--skip-pull-image`,
        `--force-image-build`
    ]
    if (Object.keys(parameters).length > 0) {
        let parameterString = ''
        for (let key in parameters) {
            parameterString += `ParameterKey=${key},ParameterValue=${parameters[key]}`
        }
        args.push(`--parameter-overrides`, parameterString)
    }
    if (process.env.AWS_PROFILE) {
        args.push(`--profile`, process.env.AWS_PROFILE)
    }
    if (eventPath) {
        args.push('-e', eventPath)
    } else {
        args.push('--no-event')
    }
    log.info(command, args.join(' '))
    spawn(command, args, {
        stdio: 'inherit',
        shell: true
    })
}

module.exports.samLocalStartLambda = async(prefix, region, port = 3001, templateName = 'template') => {
    const templateFile = await templateResolver(prefix, templateName, region, {
        localInvoke: true
    })
    const args = [
        `local`, `start-lambda`,
        `-t`, `${templateFile}`,
        `-n`, `${prefix}/env.json`,
        `-p`, port,
        `--debug`,
        `--skip-pull-image`,
        `--force-image-build`
    ]
    if (process.env.AWS_PROFILE) {
        args.push(`--profile`, process.env.AWS_PROFILE)
    }
    log.info(command, args.join(' '))
    spawn(command, args, {
        stdio: 'inherit',
        shell: true
    })
}
