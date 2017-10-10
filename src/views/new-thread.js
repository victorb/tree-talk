import React, { Component } from 'react'
import { IndexLink, hashHistory } from 'react-router'

import { bindValueToState, getIDFromNode } from './utils.js'

import { CHANNEL } from '../constants.js'

export default class NewThreadView extends Component {
  constructor (props) {
    super(props)
    this.bindValueToState = bindValueToState.bind(this)
    this.state = {
      currentSubject: '',
      currentBody: '',
      currentTags: '',
      creating: false
    }
  }
  createThread () {
    this.setState({creating: true})
    const msg = {
      type: 'THREAD',
      thread: {
        from: {
          id: getIDFromNode(this.props.node),
          username: this.props.username
        },
        subject: this.state.currentSubject,
        body: this.state.currentBody,
        tags: this.state.currentTags.split(','),
        created_at: new Date()
      }
    }
    console.log('creating thread', msg)
    // const msgToSend = new Buffer(JSON.stringify(msg))
    // this.props.node.files.add(msgToSend, (err, res) => {
    this.props.node.dag.put(msg, {format: 'dag-cbor'}, (err, dag) => {
      if (err) throw err
      const hash = dag.toBaseEncodedString()
      console.log('thread hash', hash)
      this.props.node.pubsub.publish(CHANNEL, new Buffer(hash), (err) => {
        if (err) throw err
        console.log('published')
        this.setState({currentSubject: '', currentBody: '', creating: false, currentTags: ''})
        hashHistory.push('/threads/' + hash)
      })
    })
  }
  render () {
    const buttonClassNames = this.state.creating ? 'button is-success is-loading' : 'button is-success'
    return <div className='columns'>
      <div className='column is-half'>
        <label className='label' htmlFor='subject'>Title</label>
        <p className='control'>
          <input type='text' className='input' placeholder='Thread Subject' onChange={this.bindValueToState('currentSubject')} />
        </p>
        <label className='label' htmlFor='body'>Body</label>
        <p className='control'>
          <textarea className='textarea' placeholder='Body' onChange={this.bindValueToState('currentBody')} />
        </p>
        <label className='label' htmlFor='subject'>Tags</label>
        <p className='control'>
          <input type='text' className='input' placeholder='Tags separated by comma' onChange={this.bindValueToState('currentTags')} />
        </p>
        <div className='block'>
          <button className={buttonClassNames} onClick={this.createThread.bind(this)}>Create Thread</button>
          &nbsp;
          <IndexLink to='/' className='button is-danger is-outlined'>Cancel</IndexLink>
        </div>
      </div>
    </div>
  }
}
