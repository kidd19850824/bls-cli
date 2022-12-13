'use strict'

const Git = require('nodegit')

module.exports = {
    getCurrentBranch(modulePath) {
        return new Promise((resolve, reject) => {
            try {
                Git.Repository.open(modulePath).then(repository => {
                    repository.getCurrentBranch().then(branch => {
                        resolve(branch.name())
                    })
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getStatus(modulePath) {
        return new Promise((resolve, reject) => {
            try {
                let status = []
                Git.Repository.open(modulePath).then(repository => {
                    repository.getStatus().then(files => {
                        files.forEach(file => {
                            status.push({
                                path: file.path(),
                                status: file.status().pop().replace('WT_', '').toLowerCase(),
                                isTypechange: file.isTypechange(),
                                isIgnored: file.isIgnored(),
                                isRenamed: file.isRenamed(),
                                isNew: file.isNew(),
                                isModified: file.isModified(),
                                isConflicted: file.isConflicted(),
                                isDeleted: file.isDeleted()
                            })
                        })
                        resolve(status)
                    })
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    pull(modulePath) {
        return new Promise((resolve, reject) => {
            try {
                Git.Repository.open(modulePath).then(repository => {
                    return repository.fetchAll({
                        callbacks: {
                            credentials(url, username) {
                                return Git.Cred.sshKeyFromAgent(username)
                            },
                            certificateCheck() {
                                return 0
                            }
                        }
                    })
                }).then(() => {
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
