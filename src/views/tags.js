import React from 'react'
import { hashHistory } from 'react-router'

const goToTag = (tagName) => {
  return () => {
    hashHistory.push('/tags/' + tagName)
  }
}

const Tags = ({tags}) => {
  if (tags.length > 0) {
    const toRender = tags.map((t) => {
      return <span className='tag is-dark' key={t} style={{marginRight: 5}} onClick={goToTag(t)}>{t}</span>
    })
    return <span>{toRender}</span>
  } else {
    return null
  }
}
export default Tags
