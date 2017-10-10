import React, { Component } from 'react'
import { IndexLink } from 'react-router'
import _ from 'lodash'

/* getIDFromNode */
import {createNode, getIDFromNode } from './utils.js'
import {CHANNEL} from '../constants.js'
import Stats from './stats'

const NODE_STATUS_STARTING = 'NODE_STATUS_STARTING'
const NODE_STATUS_RUNNING = 'NODE_STATUS_RUNNING'
const NODE_STATUS_ERROR = 'NODE_STATUS_ERROR'

const prettyStatus = {
  [NODE_STATUS_STARTING]: <div className='tag is-warning'>IPFS is starting...</div>,
  [NODE_STATUS_RUNNING]: <div className='tag is-success'>IPFS is running!</div>,
  [NODE_STATUS_ERROR]: <div className='tag is-danger'>Something went wrong starting IPFS...</div>
}

let initialUsername = 'Guest' + Math.floor(Math.random() * 1000)
const foundUsername = window.localStorage.getItem('username')
if (foundUsername) {
  initialUsername = foundUsername
} else {
  window.localStorage.setItem('username', initialUsername)
}

export default class ContainerView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      node: null,
      nodeStatus: NODE_STATUS_STARTING,
      resources: {},
      peers: [],
      username: initialUsername
    }
  }
  componentDidMount () {
    createNode('/ipfs-' + Math.floor(Math.random() * 100), (err, node) => {
      if (err) {
        this.setState({nodeStatus: NODE_STATUS_ERROR})
      } else {
        window.node = node
        this.setState({node, nodeStatus: NODE_STATUS_RUNNING})

        node.pubsub.subscribe(CHANNEL, (msg) => {
          // const isFromThisNode = msg.from === getIDFromNode(node)
          const hash = msg.data.toString()

          node.dag.get(hash, (err, dag) => {
            if (err) throw err
            console.log('## Received')
            console.log(dag.value)
            // if (dag.value.subject) {
            //   const newResources = Object.assign({}, this.state.resources)
            //   newResources[hash] = dag.value
            //   this.setState({resources: newResources})
            // } else {
            // }
            if (dag.value.type === 'STATE') {
              const newResources = Object.assign({}, this.state.resources, dag.value.hashes)
              this.setState({resources: newResources})
            }
            if (dag.value.type === 'COMMENT') {
              const newResources = Object.assign({}, this.state.resources)
              newResources[hash] = dag.value.comment
              this.setState({resources: newResources})
            }
            if (dag.value.type === 'THREAD') {
              const newResources = Object.assign({}, this.state.resources)
              newResources[hash] = dag.value.thread
              this.setState({resources: newResources})
            }
          })
        })

        const publishPosts = () => {
          if (Object.keys(this.state.resources).length > 0) {
            // const myID = getIDFromNode(this.props.node)
            // TODO only post users threads or all posts???
            // const threadsToPost = this.state.threads.filter(t => myID === t.from.id)
            const toPublish = Object.assign({}, {hashes: this.state.resources}, {
              type: 'STATE'
            })
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
        // TODO don't need to publish all posts from clients right now
        // publishPosts()

        setInterval(() => {
          node.swarm.peers((err, peers) => {
            if (err) throw err
            // length of array of all peers + ourselves
            this.setState({peers})
          })
        }, 1000 * 2.5)
      }
    })
  }
  renderDebug () {
    if (window.localStorage.debug) {
      return <div className='container'>
        <div className='columns'>
          <div className='column is-half'><pre>{JSON.stringify(this.state.threads, null, 2)}</pre></div>
          <div className='column is-half'><pre>{JSON.stringify(this.state.posts, null, 2)}</pre></div>
        </div>
      </div>
    }
    return null
  }
  handleUsernameChange (e) {
    const newUsername = e.target.value.trim()
    this.setState({username: newUsername})
    window.localStorage.setItem('username', newUsername)
  }
  render () {
    const agreed = window.localStorage.getItem('agreed')
    let childrenWithProps = null
    if (!agreed) {
      childrenWithProps = <section className='hero is-danger'>
        <div className='hero-body' style={{padding: 20}}>
          <div className='container'>
            <h1 className='title'>
              Before continuing, make sure to read through this agreement
            </h1>
            <h2 className='subtitle'>
              Anything read here can be posted by anyone
            </h2>
            <h2 className='subtitle'>
              If you don't like what you read, close down the website
            </h2>
            <h2 className='subtitle'>
              Don't break any laws in your country. It's not anonymous by default
            </h2>
            <button className='button is-success' onClick={() => {
              window.localStorage.setItem('agreed', true)
              this.forceUpdate()
            }}>I Agree</button>
          </div>
        </div>
      </section>
    } else {
      childrenWithProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, {
          node: this.state.node,
          resources: this.state.resources,
          onUsernameChange: this.handleUsernameChange.bind(this),
          username: this.state.username
        })
      })
    }
    return <div>
      <section className='hero is-dark is-bold'>
        <div className='hero-body'>
          <div className='container'>
            <h1 className='title'>
              <IndexLink to='/'>Tree-Talk</IndexLink>
            </h1>
            <h2 className='subtitle'>
              A tree in the merkle-forest where you can just hang around and talk
            </h2>
            <p className='control'>
              {prettyStatus[this.state.nodeStatus]}
            </p>
            <Stats resources={this.state.resources} peers={this.state.peers}/>
          </div>
        </div>
      </section>
      <br /><br />
      <div className='container'>
        {childrenWithProps}
      </div>
      {this.renderDebug.bind(this)()}
      <footer className='footer'>
        <div className='container'>
          <div className='content has-text-centered'>
            <p>
              <strong>Tree-Talk</strong> by <a href='https://twitter.com/victorbjelkholm' target='_blank'>Victor Bjelkholm</a>
            </p>
            <p>
              The source code is licensed <a href='http://opensource.org/licenses/mit-license.php' target='_blank'>MIT</a>
            </p>
            <p>
              The website content is licensed <a href='http://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank'>CC ANS 4.0</a>
            </p>
            <p>
              <a className='button is-info is-outlined' target='_blank' href='https://github.com/victorbjelkholm/tree-talk'>
                Source Code
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  }
}
