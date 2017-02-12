import IPFS from 'ipfs'

export const bindValueToState = function (stateKey) {
  return (e) => {
    this.setState({[stateKey]: e.target.value})
  }
}

export const getIDFromNode = (node) => node._peerInfo.id._idB58String

export const createNode = (callback) => {
  // const isProd = process.env.NODE_ENV === 'production'
  // const repoPath = isProd ? '/ipfs' : '/ipfs/' + Math.random()
  const repoPath = '/ipfs/' + Math.random()

  const node = new IPFS(repoPath)

  // Initialize our repository with no extra files
  window.node = node
  node.init({ emptyRepo: true }, updateConfig)

  function updateConfig () {
    // if (err) return callback(err)
    // Retrieve the initialized default configuration
    node.config.get((err, config) => {
      if (err) return callback(err)

      // Add our webrtc-star address so we can find other peers easily
      const signalDomain = 'star-signal.cloud.ipfs.team'
      const wstarMultiaddr = `/libp2p-webrtc-star/dns/${signalDomain}/wss/ipfs/${config.Identity.PeerID}`
      config.Addresses.Swarm = config.Addresses.Swarm.concat([ wstarMultiaddr ])

      // Set the new configuration
      node.config.replace(config, bootNode)
    })
  }

  function bootNode (err) {
    if (err) return callback(err)

    node.load((err) => {
      if (err) return callback(err)

      // Actually start all the services and start ipfs
      node.goOnline((err) => {
        if (err) return callback(err)
        callback(null, node)
      })
    })
  }
}
