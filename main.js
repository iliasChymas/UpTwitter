import { fork } from "child_process"
import { configs } from "./config.js"

//const child = fork("tweet.js")
let children = []

for (let i=0; i<configs.length; i++) {
  let child = fork("tweet.js", {
    env: Object.assign(process.env, configs[i])
  })
  children.push(child)
}
