import Twit from 'twit'
import fs from 'fs'

const TWEET_DELAY = 40000
function getRandomNuber(max) {
  return Math.floor(Math.random() * max)
}
const T = new Twit({
  consumer_secret: process.env.consumer_secret,
  consumer_key: process.env.consumer_key,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
  timeout_ms: process.env.timeout_ms,
  strictSSL: Boolean(process.env.strictSSL)
})


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

const getTweetsForHashtag = (hashtag, count) => {
  return new Promise((resolve, reject) => {
    T.get('search/tweets', { q: `#${hashtag}`, count: count, reslut_type: 'recent' }, function(err, data, _response) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const main = async (config) => {
  let blacklisted = JSON.parse(fs.readFileSync("cache.json", 'utf-8')) || []
  let postData = JSON.parse(fs.readFileSync("data.json", 'utf-8'))

  for (let i = 0; i < postData.length; i++) {
    const tweets = await getTweetsForHashtag(`${postData[i].name}`, postData[i].count)
    const firstTimeTweets = tweets.statuses.filter(status => !blacklisted.includes(status.id_str));
    const len = postData[i].replies.length
    console.log(postData[i].replies)
    for (let j = 0; j < firstTimeTweets.length; j++) {
      let replyIndex = getRandomNuber(len)
      try {
        let image = ""
        try {
          if (postData[i].replies[replyIndex].image !== "") {
            image = await ImageUpload(postData[i].replies[replyIndex].image)
          }
        } catch (err) {
          console.log("No image for this post")
        }
        await postTweet(postData[i].replies[replyIndex].text, firstTimeTweets[j].id_str, image, "")
        setTimeout(() => { }, TWEET_DELAY)
      } catch (err) {
        console.log(err)
      }
      blacklisted.push(firstTimeTweets[j].id_str)
    }
  }
  fs.writeFileSync("cache.json", JSON.stringify(blacklisted))
}

main()
