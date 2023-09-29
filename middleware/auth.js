const config = require('../config.json')
const con = require('../other/mysqlConnection')

const logger = require('../other/logger')
const language = require('../other/language')

function auth(req, res, next) {
    if (req.path.includes('css') || req.path.includes('js') || req.path.includes('img') 
    || req.path.includes('endpoint') || req.path.includes('01') || req.path.includes('02') 
    || req.path.includes('people') || req.path.includes('communities/0/posts')) {
        console.log(logger.Get(req.originalUrl))
        return next()
    } else {
        
        switch (req.method) {
            case "GET":
                console.log(logger.Get(req.originalUrl))
                break;
            case "POST":
                console.log(logger.Post(req.originalUrl))
                break;
            default:
                break;
        }

        var service_token = (req.get('x-nintendo-servicetoken')) ? req.get('x-nintendo-servicetoken') : config.guest_token

        con.query(`SELECT * FROM account WHERE serviceToken="${service_token.toString().slice(0, 42)}"`, function (err, result, fields) {
            if (err) { throw err }

            if (result.length !== 0) {
                if (result[0].banned === 1) {
                    res.render('portal/ban.ejs')
                } else {
                    req.account = result
                    req.language = language.getUserLanguage(result[0])
                    return next()
                }
            } else {
                console.log(logger.Error('Could not find account matching ' + service_token.toString().slice(0, 42)))
                res.status(401)
                .render('portal/setup/new_user_01.ejs', {
                    language : language.getSetupLanguage()
                })
            }
        })
    }

    
}

module.exports = auth