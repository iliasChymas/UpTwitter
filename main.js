import { fork } from "child_process"
import { configs } from "./config.js"

let children = []
const timer = ms => new Promise(res => setTimeout(res, ms))

for (let i=0; i<configs.length; i++) {
  let child = fork("tweet.js", {
    env: Object.assign(process.env, configs[i])
  })
  children.push(child)
  timer(2000)
}
