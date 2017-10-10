/*
 * Cacher
 *
 * Run this on a server, connected to the server you want to re-share
 * and it'll take all the messages and shares them with everyone on intervals
 *
 * Parameters:
 *  Channel - Which channel to mirror. Default: 'tree-talk'
 *  RepublishingInterval - How often to republish changes. Default: 5 (seconds)
 *  MaxEntities - How many entities to save. Default: 0 (unlimited)
 *  SaveThreads - If to save threads. Default: true
 *  SavePosts - If to save posts. Default: true
 *
 * Status:
 *
 *  Currently, cacher doesn't work and dies in two scenarios. 1) is unknown why
 *  and 2) is when a peer disconnects from the network
 *
 * Todo:
 *  Save messages to disk
 *  Republish between republishers
 *  Web Dashboard
 *
 */
import { createNode, getIDFromNode } from './src/views/utils'
import { CHANNEL } from './src/constants.js'
import fs from 'fs'
console.log('Initializing...')
let allHashes = {}
try {
  allHashes = require('./.forum-cache/posts.json')
} catch (err) {
  console.log('WARNING', err)
}
createNode('./.forum-cache', (err, node) => {
  if (err) throw err
  const publishPosts = () => {
    if (Object.keys(allHashes).length > 0) {
      const toPublish = Object.assign({}, {hashes: allHashes}, {type: 'STATE'})
      console.log("## PUBLISHING")
      console.log(toPublish)
      node.dag.put(toPublish, {format: 'dag-cbor'}, (err, dag) => {
        if (err) throw err
        const hash = dag.toBaseEncodedString()
        node.pubsub.publish(CHANNEL, new Buffer(hash))
      })
    }
    setTimeout(() => { // publish list of threads
      publishPosts()
    }, 1000)
  }
  publishPosts()
  node.pubsub.subscribe(CHANNEL, (msg) => {
    const hash = msg.data.toString()
    node.dag.get(hash, (err, dag) => {
      if (err) throw err
      console.log("## Received")
      console.log(dag)
      if (dag.value.type === 'STATE') {
        Object.keys(dag.value.hashes).forEach((key) => {
          allHashes[key] = dag.value.hashes[key]
        })
      }
      if (dag.value.type === 'COMMENT') {
        allHashes[hash] = dag.value.comment
      }
      if (dag.value.type === 'THREAD') {
        allHashes[hash] = dag.value.thread
      }
      fs.writeFileSync('./.forum-cache/posts.json', JSON.stringify(allHashes))
    })
  })
})
