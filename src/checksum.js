'use strict'

const fs = require('fs')
const { log } = require('./common')
const md5Dir = require('md5-dir')

module.exports.sourceHasChanged = (workspace, parent, source) => {
    const checksumFile = `${workspace}/checksum`
    let checksumJson = {}
    try {
        if (fs.existsSync(checksumFile)) {
            checksumJson = JSON.parse(`${fs.readFileSync(checksumFile)}`)
        }
    } catch(error) {}
    if (!checksumJson[parent]) {
        checksumJson[parent] = {}
    }
    const latest = checksumJson[parent][source] ? checksumJson[parent][source] : null
    const sourcePath = `${workspace}/${parent}/${source}`
    const md5 = md5Dir.sync(sourcePath)
    log.info(`${sourcePath} md5 is ${md5}`)
    if (latest !== md5) {
        checksumJson[parent][source] = md5
        fs.writeFileSync(checksumFile, JSON.stringify(checksumJson))
        return true
    }
    return false
}