import React, { Component } from 'react'
import _ from 'lodash'

export default class State extends Component {
  render () {
    const { resources, peers } = this.props

    return <nav className='level'>
      <div className='level-item has-text-centered'>
        <div>
          <p className='heading'>Peers</p>
          <p className='title'>{peers.length + 1}</p>
        </div>
      </div>
      <div className='level-item has-text-centered'>
        <div>
          <p className='heading'>Threads</p>
          <p className='title'>{Object.keys(resources).length}</p>
        </div>
      </div>
      <div className='level-item has-text-centered'>
        <div>
          <p className='heading'>Replies</p>
          <p className='title'>{Object.keys(resources).length}</p>
        </div>
      </div>
      <div className='level-item has-text-centered'>
        <div>
          <p className='heading'>Tags</p>
          <p className='title'>{Object.keys(resources).reduce((c, p) => {
            console.log(resources)
            return c + resources[p].tags.length
          }, 0)}</p>
        </div>
      </div>
      <div className='level-item has-text-centered'>
        <div>
          <p className='heading'>Users</p>
          <p className='title'>{_.uniq(Object.keys(resources).map((e) => {
            return resources[e].from.id
          })).length}</p>
        </div>
      </div>
    </nav>
  }
}
