const axios = require('axios')
require('dotenv').config()

const app_url = process.env.APP_URL
const username = process.env.ROOT_LOGIN
const password = process.env.ROOT_PASSWORD

const auth = btoa(username + ':' + password)

axios.get(app_url + '/api/farm', {
    headers: {
        Authorization: 'Basic ' + auth
    }
}).then(() => {
    console.log('Ok')
}).catch((e) => {
    console.error('Farm error: ' + e)
})