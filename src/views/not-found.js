import React from 'react'
import { IndexLink } from 'react-router'

export default function NotFound () {
  return <section className='hero is-fullheight is-danger'>
    <div className='hero-body'>
      <div className='container'>
        <h1 className='title'>
          404 - Not Found
        </h1>
        <h2 className='subtitle'>
          <p className='control'>
            Sorry, couldn't find the page that you wanted to load...
          </p>
          <p className='control'>
            <IndexLink className='button is-info' to='/'>Go back home</IndexLink>
          </p>
        </h2>
      </div>
    </div>
  </section>
}
