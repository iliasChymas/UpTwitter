import Twit from 'twit'
import fs from 'fs'
import { config } from './config.js'

const T = new Twit(config)

function getRandomNuber(max) {
  return Math.floor(Math.random() * max)
}

const ImageUpload = (imagePath) => {
  let b64content = fs.readFileSync(imagePath, { encoding: 'base64' })
  return new Promise((resolve, reject) => {
    T.post('media/upload', { media_data: b64content }, function(err, data, _response) {
      if (err) reject(err)
      resolve(data.media_id_string)
    })
  })
}


const postTweet = (status, ptid, image, attachmentUrl) => {
  let params = { status: status, in_reply_to_status_id: ptid, auto_populate_reply_metadata: true }
  if (image !== undefined) {
    params.media_ids = image
  }
  if (attachmentUrl !== "") {
    params.attachment_url = attachmentUrl
  }
  return new Promise((resolve, reject) => {
    T.post("statuses/update", params, function(err, data, _response) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}
// fs.writeFileSync("replied.json", JSON.stringify(repliedJson))


const getTweetsForHashtag = (hashtag, count) => {
  return new Promise((resolve, reject) => {
    T.get('search/tweets', { q: `#${hashtag}`, count: count, reslut_type: 'recent' }, function(err, data, response) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const main = async () => {
  let blacklisted = JSON.parse(fs.readFileSync("cache.json", 'utf-8')) || []
  let postData = JSON.parse(fs.readFileSync("data.json", 'utf-8'))
  for (let i = 0; i < postData.length; i++) {
    const tweets = await getTweetsForHashtag(`${postData[i].name}`, postData[i].count)
    const firstTimeTweets = tweets.statuses.filter(status => !blacklisted.includes(status.id_str));
    for (let i = 0; i < firstTimeTweets.length; i++) {
      let len = postData[i].replies.length || 0
      console.log(len)
      let replyIndex = getRandomNuber(len)
      try {
        let image = ""
        try {
          if (postData[i]?.replies[replyIndex]?.image !== "") {
            image = await ImageUpload(postData[i].replies[replyIndex].image)
          }
        } catch (err) {
          console.log("No imag for htis post")
        }
        await postTweet(postData[i].replies[replyIndex].text, firstTimeTweets[i].id_str, image, "")
        setTimeout(() => { }, 40000)
      } catch (err) {
        console.log(err)
      }
      blacklisted.push(firstTimeTweets[i].id_str)
    }
  }
  fs.writeFileSync("cache.json", JSON.stringify(blacklisted))
}

main()
