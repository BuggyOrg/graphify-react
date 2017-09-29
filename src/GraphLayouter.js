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
    this.updateGraph(this.props.kgraph)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.kgraph !== this.props.kgraph) {
      this.setState({ graph: null })
      this.updateGraph(nextProps.kgraph)
    } else if (nextProps.options !== this.props.options) {
      this.updateGraph(nextProps.kgraph)
    }
  }

  updateGraph (kgraph) {
    if (kgraph == null) return

    layout(kgraph, calculateSize, this.props.options).then((graph) => {
      if (this.props.kgraph === kgraph) {
        this.setState({ graph })
      }
    })
    .catch((e) => console.error(e))
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

    return graph != null ? (
      <Graph
        graph={graph}
        translateX={translateX}
        translateY={translateY}
        scale={scale}
        {...other}
      />
    ) : (
      <svg {...other} />
    )
  }
}

export function layout (graph, calculateSize, options = {}) {
  // wrap the given kgraph in another graph for layouting to support ports on the original root node
  graph = {
    id: `graphify_root_${Date.now()}`,
    children: [ graph ],
    edges: []
  }
  return graphify.layout(graph, calculateSize, options)
  .then((graph) => graph.children[0]) // unwrap the graph
}
