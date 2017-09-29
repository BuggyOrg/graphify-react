import React, { Component } from 'react'
import calculateSize from 'calculate-size'
import graphify from 'graphify-node'
import Graph from './Graph'

export default class GraphLayouter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      graph: null
    }
  }

  componentDidMount () {
    this.updateGraph(this.props.kgraph)
  }

  componentWillReceiveProps ({ kgraph, options }) {
    if (kgraph !== this.props.kgraph || options !== this.props.options) {
      this.updateGraph(kgraph)
    }
  }

  updateGraph (kgraph) {
    if (kgraph == null) {
      this.setState({ graph: null })
    } else {
      layout(kgraph, calculateSize, this.props.options).then((graph) => {
        if (this.props.kgraph === kgraph) {
          this.setState({ graph })
        }
      })
      .catch((e) => {
        this.setState({ graph: null })
        console.error(e)
      })
    }
  }

  render () {
    const { graph } = this.state
    const {
      kgraph, // eslint-disable-line
      translateX,
      translateY,
      scale,
      ...other
    } = this.props

    return (
      <Graph
        graph={graph}
        translateX={translateX}
        translateY={translateY}
        scale={scale}
        {...other}
      />
    )
  }
}

export function layout (graph, calcSize = calculateSize, options = {}) {
  // wrap the given kgraph in another graph for layouting to support ports on the original root node
  graph = {
    id: `graphify_root_${Date.now()}`,
    children: [ graph ],
    edges: []
  }
  return graphify.layout(graph, calcSize, options)
  .then((graph) => graph.children[0]) // unwrap the graph
}
