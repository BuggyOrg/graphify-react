/* eslint-env jest */
import React from 'react'
import renderer from 'react-test-renderer'
import { Graph, layout } from '../src'
import fac from '../stories/fac.json'
import facHighlighted from '../stories/facHighlighted.json'
import multipleInputToOutput from '../stories/multipleInputToOutput.json'

function fakeCalculateSize (text, options) {
  return {
    width: text.length * 5,
    height: 7
  }
}

async function renderGraphToJson (graph) {
  const layoutedGraph = await layout(graph, fakeCalculateSize)
  return renderer.create(<Graph graph={layoutedGraph} />).toJSON()
}

test('factorial graph', async () => {
  expect(await renderGraphToJson(fac)).toMatchSnapshot()
})

test('factorial with highlighted nodes', async () => {
  expect(await renderGraphToJson(facHighlighted)).toMatchSnapshot()
})

test('multiple input ports to one output port', async () => {
  expect(await renderGraphToJson(multipleInputToOutput)).toMatchSnapshot()
})
