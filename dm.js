import Twit from "twit"
import { configs, handlesToDm } from './config.js'
import { parse } from 'csv-parse'
import fs from "fs"
const T = Twit(configs[0]);

const ImageUpload = (imagePath) => {
  let b64content = fs.readFileSync(imagePath, { encoding: 'base64' })
  return new Promise((resolve, reject) => {
    T.post('media/upload', { media_data: b64content }, function(err, data, _response) {
      if (err) reject(err)
      resolve(data.media_id_string)
    })
  })
}


const timer = ms => new Promise(res => setTimeout(res, ms))

const getUserInfo = (tHandle) => {
  return new Promise((reject, resolve) => {
    T.get("users/show", { screen_name: tHandle }, function(data, err, _response) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}
//let user = await getUserInfo(twitterHandleToDm)

const sendMessage = (text, uid, imageId) => {
  let data = {
    event: {
      type: "message_create", message_create: {
        target: {
          recipient_id: uid,
        },
        message_data: {
          text: text,
        }
      }
    }
  }
  if (imageId !== undefined && imageId !== "") {
    data.event.message_create.message_data.attachment = {
      type: "media",
      media: {
        id: imageId
      }
    }
  }

  console.log(data) 
  return new Promise((reject, resolve) => {
    T.post("direct_messages/events/new", data, function(data, err, _response) {
      if (err) reject(err)
      resolve(data)
    })
  })
}

fs.createReadStream("./messages.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async function(row) {
    let user = await getUserInfo(row[1])
    if (row[3] === "") {
      await sendMessage(row[2], user.id)
    } else {
      let imageId = undefined
      try {
        imageId = await ImageUpload(row[3])
      }catch(err) {
        console.log("[Error] Could not find " + row[3])
      }
      await sendMessage(row[2], user.id, imageId)
    }
    await timer(2000)
  })
  .on("end", function() {
    console.log("Every one has been messaged");
  })
  .on("error", function(error) {
    console.log(error.message);
  });

