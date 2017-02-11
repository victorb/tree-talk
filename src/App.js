import React, { Component } from 'react'
import './App.css'
import { IndexRoute, Router, Route, hashHistory } from 'react-router'
import IndexView from './views/index.js'
import ThreadView from './views/thread.js'
import NewThreadView from './views/new-thread.js'
import NotFound from './views/not-found.js'
import ContainerView from './views/container.js'

class App extends Component {
  render () {
    return <Router history={hashHistory}>
      <Route path='/' component={ContainerView}>
        <IndexRoute component={IndexView} />
        <Route path='/threads/:hash' component={ThreadView} />
        <Route path='/new-thread' component={NewThreadView} />
      </Route>
      <Route path='*' component={NotFound} />
    </Router>
  }
}

export default App
