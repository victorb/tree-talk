import React, { Component } from 'react'
// import { bindValueToState, getIDFromNode } from './utils.js'
import { bindValueToState } from './utils.js'

export default class SettingsView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {}
    }
    this.connectPeer = this.connectPeer.bind(this)
    this.bindValueToState = bindValueToState.bind(this)
  }
  componentDidUpdate (prevProps, prevState) {
    if (Object.is(this.state.config, prevState.config) && this.props.node) {
      this.props.node.config.get((err, config) => {
        console.log(config)
        this.setState({config})
      })
    }
  }
  connectPeer (multiaddr) {
    return () => {
      this.props.node.swarm.connect(multiaddr)
    }
  }
  render () {
    // Addresses
    // Discovery
    // MDNS
    // webrtc-star
    // identity
    // peers
    return <div>
      <h1 className='title'>Settings</h1>
      <div>
        Connect to peer: <input type='text' placeholder='Peer Multiaddr' onChange={this.bindValueToState('multiaddr')}/>
      </div>
      <button onClick={this.connectPeer(this.state.multiaddr)}>Connect</button>
      <div><pre>{JSON.stringify(this.state.config, null, 2)}</pre></div>
    </div>
  }
}
