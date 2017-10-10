import React, { Component } from 'react'
import _ from 'lodash'
import { IndexLink } from 'react-router'

import IdenticonJS from 'identicon.js'
import Tags from './tags.js'

import { bindValueToState, getIDFromNode } from './utils.js'

import { CHANNEL } from '../constants.js'

const reverse = (s) => {
  return s.split('').reverse().join('')
}

export default class ThreadView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentBody: ''
    }
    this.bindValueToState = bindValueToState.bind(this)
  }
  reply () {
    const thread = this.props.resources[this.props.params.hash]
    // const thread = _.find(this.props.threads, {hash: this.props.params.hash})
    const msg = {
      type: 'COMMENT',
      comment: {
        from: {
          id: getIDFromNode(this.props.node),
          username: this.props.username
        },
        thread: this.props.params.hash,
        body: this.state.currentBody,
        created_at: new Date()
      }
    }
    this.props.node.dag.put(msg, {format: 'dag-cbor'}, (err, dag) => {
      if (err) throw err
      this.props.node.pubsub.publish(CHANNEL, new Buffer(dag.toBaseEncodedString()), () => {
        this.setState({currentBody: ''})
      })
    })
  }
  render () {
    const thread = this.props.resources[this.props.params.hash]
    console.log(this.props.resources)
    if (thread) {
      console.log('rendering', thread)
      const posts = _.filter(this.props.resources, (r) => {
        return r.thread && r.thread === this.props.params.hash
      })
      // const posts = _.groupBy(this.props.posts, 'threadID')[this.props.params.hash]
      let postsToRender = null
      if (posts) {
        postsToRender = posts.map((post) => {
          const avatarData = new IdenticonJS(reverse(post.from.id), 50)
          return <div className='box' key={post.hash}>
            <div className='columns'>
              <div className='column is-one-third'>
                <article className='media'>
                  <div className='media-left'>
                    <img width={50} height={50} src={'data:image/png;base64,' + avatarData} />
                  </div>
                  <div className='media-content'>
                    <div className='content'>
                      <div>Username: {post.from.username}</div>
                      <div>Date: {post.created_at.toString()}</div>
                    </div>
                  </div>
                </article>
              </div>
              <div className='column'>
                <div className='content'>
                  {post.body}
                </div>
              </div>
            </div>
          </div>
        })
      }
      const avatarData = new IdenticonJS(reverse(thread.from.id), 50)
      return <div className='container'>
        <p className='control'>
          <IndexLink to='/' className='button is-info is-outlined'>Go Back</IndexLink>
        </p>
        <div className='box'>
          <div className='columns'>
            <div className='column is-one-third'>
              <article className='media'>
                <div className='media-left'>
                  <img width={50} height={50} src={'data:image/png;base64,' + avatarData} />
                </div>
                <div className='media-content'>
                  <div className='content'>
                    <div>Username: {thread.from.username}</div>
                    <div>Date: {thread.created_at.toString()}</div>
                  </div>
                </div>
              </article>
            </div>
            <div className='column'>
              <h1 className='title'>{thread.subject}</h1>
              <div className='content'>
                {thread.body}
              </div>
              <div className='container'>
                <Tags tags={thread.tags} />
              </div>
            </div>
          </div>
        </div>
        {postsToRender}
        <div className='box'>
          <div className='column is-half'>
            <label className='label' htmlFor='body'>Reply</label>
            <p className='control'>
              <textarea className='textarea' placeholder='Body' value={this.state.currentBody} onChange={this.bindValueToState('currentBody')} />
            </p>
            <button className='button is-success' onClick={this.reply.bind(this)}>Send</button>
          </div>
        </div>
      </div>
    } else {
      return <div className='container'>
        <p className='control'>
          <IndexLink to='/' className='button is-info is-outlined'>Go Back</IndexLink>
        </p>
        <h1 className='title'>Could not found thread. Either it doesn't exists or we haven't loaded it yet...</h1>
      </div>
    }
  }
}
