'use strict'

const fs = require('fs')
const { log } = require('./common')
const { spawn } = require('child_process')

module.exports = async(config, argv) => {
    const sources = ['apps', 'clients', 'layers']
    const targets = ['node_modules', 'package-lock.json']
    for (let dirname of fs.readdirSync(config.workspace)) {
        if (/^bls-/.test(dirname)) {
            const modulePath = `${config.workspace}/${dirname}`
            for (let sub of sources) {
                let subPath = `${modulePath}/${sub}`
                for (let targetName of targets) {
                    let target = `${subPath}/${targetName}`
                    if (!fs.existsSync(target)) {
                        continue
                    }
                    let stat = fs.lstatSync(target)
                    if (stat.isFile()) {
                        log.error(`Clean ${target}`)
                        fs.unlinkSync(target)
                    } else if (stat.isDirectory()) {
                        try {
                            log.error(`Clean ${target}`)
                            await removeDirectory(target)
                        } catch (error) {
                            log.fatal(error)
                        }
                    }
                }
            }
        }
    }
    log.success('Clean projects complete')
}

const removeDirectory = (target) => {
    return new Promise((resolve, reject) => {
        const rm = spawn('rm', [
            '-rf', target
        ], {
            stdio: 'inherit'
        })
        rm.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}
