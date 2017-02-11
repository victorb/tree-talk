import React, { Component } from 'react'
import { IndexLink } from 'react-router'
import _ from 'lodash'

import { getIDFromNode, createNode } from './utils.js'

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
      threads: [],
      posts: [],
      username: initialUsername,
      numberOfPeers: 0,
      numberOfMessages: 0
    }
  }
  componentDidMount () {
    createNode((err, node) => {
      if (err) {
        console.log('got error', err)
        this.setState({nodeStatus: NODE_STATUS_ERROR})
      } else {
        this.setState({node, nodeStatus: NODE_STATUS_RUNNING})

        node.pubsub.subscribe('tree-talk', (msg) => {
          this.setState({numberOfMessages: this.state.numberOfMessages + 1})
          const hash = msg.data.toString()
          node.files.cat(hash, (err, stream) => {
            if (err) throw err
            const data = []
            stream.on('data', (d) => {
              data.push(d)
            })
            stream.on('end', () => {
              const parsedData = JSON.parse(data.join(''))
              if (parsedData.from.id !== msg.from) {
                console.warn('throw away message, its fake')
                console.log(msg, parsedData)
              } else {
                parsedData.hash = hash
                if (parsedData.threads) { // it's a users collection of threads
                  const promises = parsedData.threads.map((t) => {
                    return new Promise((resolve, reject) => {
                      node.files.cat(t, (err, stream) => {
                        if (err) reject(err)
                        const data = []
                        stream.on('data', (d) => {
                          data.push(d)
                        })
                        stream.on('end', () => {
                          const parsedData = JSON.parse(data.join(''))
                          parsedData.hash = t
                          resolve(parsedData)
                        })
                      })
                    })
                  })
                  Promise.all(promises).then((threads) => {
                    this.setState({
                      threads: _.uniqBy(this.state.threads.concat(threads), 'hash')
                    })
                  })
                  return
                }
                if (parsedData.posts) { // it's a users collection of posts
                  const promises = parsedData.posts.map((p) => {
                    return new Promise((resolve, reject) => {
                      node.files.cat(p, (err, stream) => {
                        if (err) reject(err)
                        const data = []
                        stream.on('data', (d) => {
                          data.push(d)
                        })
                        stream.on('end', () => {
                          const parsedData = JSON.parse(data.join(''))
                          parsedData.hash = p
                          resolve(parsedData)
                        })
                      })
                    })
                  })
                  Promise.all(promises).then((posts) => {
                    this.setState({
                      posts: _.uniqBy(this.state.posts.concat(posts), 'hash')
                    })
                  })
                  return
                }
                if (parsedData.subject) { // it's a thread
                  this.setState({
                    threads: _.uniqBy(this.state.threads.concat([parsedData]), 'hash')
                  })
                  return
                }
                if (parsedData.threadID) { // it's a post
                  this.setState({
                    posts: this.state.posts.concat([parsedData])
                  })
                  return
                }
              }
            })
          })
        })

        const publishThreads = () => {
          if (this.state.threads.length > 0) {
            const myID = getIDFromNode(node)
            // TODO only post users threads or all posts???
            // const threadsToPost = this.state.threads.filter(t => myID === t.from.id)
            const threadsToPost = this.state.threads
            const msg = {
              threads: threadsToPost.map(t => t.hash),
              from: {id: myID}
            }
            const msgToSend = new Buffer(JSON.stringify(msg))
            node.files.add(msgToSend, (err, res) => {
              if (err) throw err
              const hash = res[0].hash
              node.pubsub.publish('tree-talk', new Buffer(hash))
            })
          }
          setInterval(() => { // publish list of threads
            publishThreads()
          }, 1000 * this.state.numberOfPeers)
        }

        const publishPosts = () => {
          if (this.state.posts.length > 0) {
            const myID = getIDFromNode(node)
            // TODO only post users threads or all posts???
            // const threadsToPost = this.state.threads.filter(t => myID === t.from.id)
            const postsToPost = this.state.posts
            const msg = {
              posts: postsToPost.map(p => p.hash),
              from: {id: myID}
            }
            const msgToSend = new Buffer(JSON.stringify(msg))
            node.files.add(msgToSend, (err, res) => {
              if (err) throw err
              const hash = res[0].hash
              node.pubsub.publish('tree-talk', new Buffer(hash))
            })
          }
          setInterval(() => { // publish list of threads
            publishPosts()
          }, 1000 * this.state.numberOfPeers)
        }

        setInterval(() => {
          node.swarm.peers((err, peers) => {
            if (err) throw err
            this.setState({numberOfPeers: peers.length})
          })
        }, 1000 * 2.5)

        // TODO remove, only for dev
        // setTimeout(() => {
        //   const msg = {
        //     from: {
        //       id: getIDFromNode(node)
        //     },
        //     subject: 'Example Thread',
        //     body: 'This is just a little example thread!',
        //     created_at: new Date()
        //   }
        //   const msgToSend = new Buffer(JSON.stringify(msg))
        //   node.files.add(msgToSend, (err, res) => {
        //     if (err) throw err
        //     node.pubsub.publish('tree-talk', new Buffer(res[0].hash))
        //   })
        // }, 2000)
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
          threads: this.state.threads,
          posts: this.state.posts,
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
            <nav className='level'>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Peers</p>
                  <p className='title'>{this.state.numberOfPeers}</p>
                </div>
              </div>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Received Pings</p>
                  <p className='title'>{this.state.numberOfMessages}</p>
                </div>
              </div>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Threads</p>
                  <p className='title'>{this.state.threads.length}</p>
                </div>
              </div>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Replies</p>
                  <p className='title'>{this.state.posts.length}</p>
                </div>
              </div>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Tags</p>
                  <p className='title'>{this.state.threads.reduce((c, p) => {
                    return c + p.tags.length
                  }, 0)}</p>
                </div>
              </div>
              <div className='level-item has-text-centered'>
                <div>
                  <p className='heading'>Users</p>
                  <p className='title'>{_.uniq(this.state.threads.concat(this.state.posts).map((e) => {
                    return e.from.id
                  })).length}</p>
                </div>
              </div>
            </nav>
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
