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
console.log('Initializing...')
const allHashes = {}
createNode('./.forum-cache', (err, node) => {
  console.log('Started')
  if (err) throw err
  setInterval(() => {
    console.log('Publishing saved hashes')
    Object.keys(allHashes).forEach((hash) => {
      node.pubsub.publish(CHANNEL, new Buffer(hash))
    })
  }, 2000)
  node.pubsub.subscribe(CHANNEL, (msg) => {
    const hash = msg.data.toString()
    console.log('Got message')

    if (msg.from === getIDFromNode(node)) {
      return console.log('from myself, ignoring')
    }

    console.log(hash)
    allHashes[hash] = true
    console.log('Getting DAG')
    node.dag.get(hash, (err, dag) => {
      console.log(err, dag)
      node.dag.put(dag.value, {format: 'dag-cbor'}, (err, res) => {
        console.log(err, res)
      })
    })
  })
})
