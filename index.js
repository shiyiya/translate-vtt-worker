var crypto = require('crypto')

const reg =
  /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi

// https://github.com/wytxer/nest-translate/blob/main/lib/baidu.service.ts
// https://github.com/li-car-fei/electron-demo/blob/b7e14e9d585f44dfcaca8e93248cd33950557c88/src/renderer/module/Tran_config.js
const config = {
  appid: '20221110001445220',
  secret: 'A2NjltZ3dnUIhud_iaJk',
  url: 'https://fanyi-api.baidu.com/api/trans/vip/translate'
}

async function start(rawVtt) {
  const vttDefinitions = rawVtt.split(/[\r\n][\r\n]/i)
  const transl = vttDefinitions
    .reduce((pre, vttDef) => {
      if (vttDef.match(reg)) {
        const segment = vttDef.split(/[\r\n]/i)
        return segment.shift(), `${pre}|${segment.join('#')}`
      }
      return pre
    }, '')
    .substring(1)

  console.log('--------')
  console.log(transl)
  console.log('\r\n')

  const { appid, salt = Date.now().toString(), secret, url } = config
  let translated = await fetch(
    `${url}?q=${transl}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${crypto
      .createHash('md5')
      .update([appid, transl, salt, secret].join(''))
      .digest('hex')}`
  )
    .then((response) => response.json())
    .then((response) => {
      console.log('--------')
      console.log(response)
      console.log('\r\n')

      return response.trans_result
    })
    .catch((err) => {
      console.log('----ERROR----')
      console.error(err)
      console.log('\r\n')
    })

  if (!translated) return

  const result = vttDefinitions.reduce(
    (pre, vttDef, i) => {
      if (vttDef.match(reg)) {
        const segment = vttDef.split(/[\r\n]/i)
        const time = segment.shift()

        return `${pre}${time}
${translated[i]}
`
      }

      return pre
    },
    `WEBVTT

`
  )

  console.log(result)
}

start(`WEBVTT

00:04.080 --> 00:06.080
The world is awash in pain.

00:06.420 --> 00:10.040
Now, wars are fought between spies
over information -`)
