import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { GraphLayouter } from '../src'
import fac from './fac.json'
import facHighlighted from './facHighlighted.json'
import fixture001 from './multipleInputToOutput.json'

storiesOf('kgraph', module)
  .add('factorial', () => (
    <GraphLayouter
      kgraph={fac}
    />
  ))
  .add('highlighted node', () => (
    <GraphLayouter
      kgraph={facHighlighted}
    />
  ))
  .add('fixture 001', () => (
    <GraphLayouter
      kgraph={fixture001}
    />
  ))
