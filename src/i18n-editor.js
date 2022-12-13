'use strict'

const { showArgument, log } = require('./common')
const modules = {
    fs: require('fs'),
    aws: require('aws-sdk'),
    request: require('request'),
    express: require('express'),
    bodyParser: require('body-parser'),
    chineseConv: require('chinese-conv')
}

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Start client dev-server with your application')
        showArgument('-m', 'Your module name, ex: bootstrap')
        return true
    }
    const moduleName = argv.m
    const modulePath = `${config.workspace}/bls-${moduleName}/clients/src/locales`

    let app = modules.express()
    let url = 'localhost'
    let port = argv.p || '7777'
    let service = 'gcp'
    let gcpKey = ''
    let awsTranslate = null
    let contentPrefixName = ''
    let supportLangs = ['en', 'en-us', 'zh-tw', 'zh-TW', 'zh', 'zh-cn', 'zh-CN']
    let serviceOptions = ['aws', 'gcp']
    let langOptions = ['en', 'zh-TW', 'zh-CN']

    let mapping = {
        'en-us': 'en',
        'zh-tw': 'zh-TW',
        'zh': 'zh-CN',
        'zh-cn': 'zh-CN'
    }

    let files = modules.fs.readdirSync(modulePath).filter((fileName) => {
        let [, ext] = fileName.split('.')
        return ext === 'js' || ext === 'json'
    })

    try {
        modules.fs.mkdirSync(config.workspace + '/i18n_backup')
    } catch (e) {}

    for (let fileName of files) {
        modules.fs.writeFileSync(`${config.workspace}/i18n_backup/${fileName}`, modules.fs.readFileSync(modulePath + '/' + fileName, 'utf8'))
    }
    app.use(modules.bodyParser.json())
    app.get('/', (request, response) => {
        response.writeHeader(200, { 'Content-Type': 'text/html' })
        response.write(modules.fs.readFileSync(`${__dirname}/../static/i18n-editor/index.html`, 'utf8'))
        response.end()
    })

    app.get('/translation', async function(req, res) {
        let text = req.query.text || ''
        let source = req.query.source
        let target = req.query.target
        if (text === '') {
            return res.status(200).send(text)
        }
        if (source === 'zh-TW' && target === 'zh-CN') {
            return res.status(200).send(modules.chineseConv.sify(text))
        }
        if (source === 'zh-CN' && target === 'zh-TW') {
            return res.status(200).send(modules.chineseConv.tify(text))
        }
        let result = await translation(text, source, target)
        res.status(200).send(result)
    })

    app.get('/getFiles', async function(req, res) {
        let data = {}
        for (let dir of files) {
            let [fileName, ext] = dir.split('.')
            if (supportLangs.includes(fileName)) {
                let content = modules.fs.readFileSync(`${modulePath}/${dir}`, 'utf8')
                if (ext === 'json') {
                    data[getMappingKey(fileName)] = JSON.parse(content)
                } else {
                    // eslint-disable-next-line no-eval
                    eval('data[getMappingKey(fileName)] =' + content.replace(contentPrefixName, ''))
                }
            }
        }
        res.status(200).json(data)
    })

    app.post('/syncFiles', async function(req, res) {
        let data = req.body.data
        for (let dir of files) {
            let [fileName] = dir.split('.')
            let key = getMappingKey(fileName)
            modules.fs.writeFileSync(`${modulePath}/${dir}`, contentPrefixName + JSON.stringify(data[key], null, 4).replace(/'/g, '\\\'').replace(/"/g, '\'') + '\n')
        }
        res.status(200).send()
    })

    app.get('/langOptions', async function(req, res) {
        res.status(200).json(langOptions)
    })

    app.get('/serviceOptions', async function(req, res) {
        res.status(200).json(serviceOptions)
    })

    app.get('/setConfig', async function(req, res) {
        let file = modules.fs.readFileSync(`${modulePath}/en-us.js`, 'utf8')
        gcpKey = req.query.gcpKey
        service = req.query.service
        contentPrefixName = file.match('module.exports') ? 'module.exports = ' : 'export default '
        if (service === 'aws') {
            awsTranslate = new modules.aws.Translate({
                apiVersion: '2017-07-01',
                region: 'us-east-1'
            })
        }
        res.status(200).send()
    })

    app.get('/getTalk', async function(req, res) {
        let text = req.query.text
        let language = req.query.language
        if (text && language) {
            missGoogle(text, language)
                .then(() => {
                    res.status(200).send()
                })
        }
    })

    app.use('/', modules.express.static(`${__dirname}/../static/i18n-editor`))
    app.listen(port, function() {
        console.log(`< http://${url}:${port} >`)
    })

    function getMappingKey(key) {
        return mapping[key] || key
    }

    function missGoogle(text, language) {
        return new Promise((resolve, reject) => {
            var src = 'https://translate.google.com/translate_tts?ie=UTF-8&total=1&client=tw-ob'
            var query = '&q=' + encodeURIComponent(text) + '&tl=' + language || 'en-gb'
            modules
                .request
                .get(src + query)
                .pipe(modules.fs.createWriteStream(`${__dirname}/../static/i18n-editor/sound.mp3`))
                .on('finish', () => {
                    resolve()
                })
        })
    }

    function translation(text, source, target) {
        return new Promise((resolve, reject) => {
            if (service === 'gcp' && gcpKey) {
                modules.request({
                    uri: 'https://translation.googleapis.com/language/translate/v2',
                    method: 'POST',
                    qs: {
                        q: text,
                        key: gcpKey,
                        format: 'text',
                        source,
                        target
                    }
                }, (e, r, body) => {
                    let output = ''
                    try {
                        output = JSON.parse(body).data.translations[0].translatedText
                    } catch (error) {
                        output = ''
                    }
                    resolve(output)
                })
            }
            if (service === 'aws') {
                let params = {
                    SourceLanguageCode: source,
                    TargetLanguageCode: target,
                    Text: text
                }
                awsTranslate.translateText(params).promise().then(({ TranslatedText }) => {
                    resolve(TranslatedText)
                })
            }
        })
    }
}
