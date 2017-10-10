import IPFS from 'ipfs'
// import { SIGNAL_SERVER } from '../constants.js'

export const bindValueToState = function (stateKey) {
  return (e) => {
    this.setState({[stateKey]: e.target.value})
  }
}

export const getIDFromNode = (node) => node._peerInfo.id._idB58String

export const createNode = (repo, callback) => {
  if (repo === undefined) {
    callback(new Error('repo has to be defined'))
  }
  if (callback === undefined) {
    throw new Error('callback has to be defined')
  }

  const node = new IPFS({
    repo: repo,
    EXPERIMENTAL: { // enable experimental features
      pubsub: true
    },
    // config: { // overload the default config
    //   // Discovery: {
    //   //   webRTCStar: {
    //   //     Enabled: true
    //   //   }
    //   // },
    //     Swarm: [
    //       // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
    //       SIGNAL_SERVER,
    //       // '/ip4/127.0.0.1/tcp/4000/ws'
    //     ]
    //   }
    // }
  })

  node.on('start', () => {
    // should hardcode to tree-talk signal server
    node.swarm.connect('/dns/tree-talk.io/tcp/4003/ws/ipfs/QmR61SucnaVrrhsYURcQVWEkMK46tfRhUqGX2CfRsoqWCk')
    console.log('node started')
    //node.config.get((err, config) => {
    //  if (err) return callback(err)
    //  const signalDomain = '127.0.0.1/tcp/9090'
    //  const wstarMultiaddr = `/libp2p-webrtc-star/ip4/${signalDomain}/ws/ipfs/${config.Identity.PeerID}`
    //  config.Addresses.Swarm = config.Addresses.Swarm.concat([ wstarMultiaddr ])
    //  node.config.replace(config, (err) => {
    //    if (err) return callback(err)
    //    callback(null, node)
    //  })
    //})
    callback(null, node)
  })

  node.on('error', (err) => {
    throw err
  })
}
    // Your now is ready to use \o/

    // stopping a node
    // node.stop(() => {
    //   // node is now 'offline'
    // })
  // Initialize our repository with no extra files
  // node.init({ emptyRepo: true }, updateConfig)

  // function updateConfig () {
  //   // if (err) return callback(err)
  //   // Retrieve the initialized default configuration

  // function bootNode (err) {
  //   if (err) return callback(err)

  //   node.load((err) => {
  //     if (err) return callback(err)

  //     // Actually start all the services and start ipfs
  //     node.goOnline((err) => {
  //       if (err) return callback(err)
  //       callback(null, node)
  //     })
  //   })
  // }
// }
