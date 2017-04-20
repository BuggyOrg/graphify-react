/* eslint-env jest */
import React from 'react'
import renderer from 'react-test-renderer'
import { Graph, layout } from '../src'
import fac from '../stories/fac.json'
import facHighlighted from '../stories/facHighlighted.json'

function fakeCalculateSize (text, options) {
  return {
    width: text.length * 5,
    height: 7
  }
}

test('factorial graph', () => {
  return layout(fac, fakeCalculateSize).then((graph) => {
    const tree = renderer.create(
      <Graph graph={graph} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

test('factorial with highlighted nodes', () => {
  return layout(facHighlighted, fakeCalculateSize).then((graph) => {
    const tree = renderer.create(
      <Graph graph={graph} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
