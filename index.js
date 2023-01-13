var crypto = require('crypto')

const reg =
  /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi

// https://github.com/wytxer/nest-translate/blob/main/lib/baidu.service.ts
// https://github.com/li-car-fei/electron-demo/blob/b7e14e9d585f44dfcaca8e93248cd33950557c88/src/renderer/module/Tran_config.js

const config = {
  appid: '20221110001445220', // 百度翻译appid
  secret: 'A2NjltZ3dnUIhud_iaJk', // 百度翻译密钥
  url: 'https://fanyi-api.baidu.com/api/trans/vip/translate' // 百度翻译api
}

async function start(rawVtt) {
  const vttDefinitions = rawVtt.split(/[\r\n][\r\n]/i)
  const transl = vttDefinitions
    .reduce((pre, vttDef) => {
      if (vttDef.match(reg)) {
        const vttSegment = vttDef.split(/[\r\n]/i)
        vttSegment.shift()
        return `${pre}|${vttSegment.join('#')}`
      }
      return pre
    }, '')
    .substring(1)

  console.log('----翻译内容----')
  console.log(transl)
  console.log('----翻译内容----')

  const { appid, salt = Date.now().toString(), secret, url } = config
  let translated = await fetch(
    `${url}?q=${transl}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${crypto
      .createHash('md5')
      .update([appid, transl, salt, secret].join(''))
      .digest('hex')}`
  )
    .then((response) => response.json())
    .then((response) => {
      console.log('----返回----')
      console.log(response)
      console.log('----返回----')

      return response.data.translations[0].translatedText.split('&amp;')
    })
    .catch((err) => console.error(err))

  let result = ''
  vttDefinitions.reduce((pre, vttDef, i) => {
    if (
      vttDef.match(
        /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi
      )
    ) {
      const vttSegment = vttDef.split(/[\r\n]/i)
      const time = vttSegment.shift()

      result += time + translated[i] + '\r\n'
      console.log(translated[i])
    }

    return pre
  }, '')

  console.log(result)
}

start(`WEBVTT

00:04.080 --> 00:06.080
The world is awash in pain.

00:06.420 --> 00:10.040
Now, wars are fought between spies
over information -`)