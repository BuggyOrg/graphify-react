import * as React from 'react'
import { findDOMNode } from 'react-dom'
import Graph from './Graph'
import { layout } from './GraphLayouter'

function translate (x, y, transform) {
  return [transform[0] + x, transform[1] + y, transform[2]]
}

const styles = {
  container: {
    userSelect: 'none'
  }
}

export default class GraphViewer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      graph: null,
      transform: [0, 0, 1],
      mouseDown: false,
      moveStartPosition: null
    }
  }

  componentWillReceiveProps ({ kgraph, options }) {
    if (kgraph !== this.props.kgraph || options !== this.props.options) {
      this.updateGraph(kgraph)
    }
  }

  setGraph = (graph) => {
    this._graph = graph
    if (graph != null) {
      this.updateGraph(this.props.kgraph)
    }
  }

  updateGraph (kgraph) {
    if (kgraph == null) {
      this.setState({ graph: null })
    } else {
      layout(kgraph).then((graph) => {
        if (this.props.kgraph === kgraph) {
          this.setState({ graph, transform: this.getFittingTransform(graph) })
        }
      })
      .catch((e) => {
        this.setState({ graph: null })
        console.error(e)
      })
    }
  }

  getFittingTransform ({ width, height }) {
    const boundingRect = findDOMNode(this._graph).getBoundingClientRect()
    if (boundingRect.width > 0 && boundingRect.height > 0) {
      const scale = Math.min(boundingRect.width / width, boundingRect.height / height)
      return [
        (boundingRect.width - width * scale) / 2 / scale,
        (boundingRect.height - height * scale) / 2 / scale,
        scale
      ]
    } else {
      return [0, 0, 1]
    }
  }

  /**
   * @public
   */
  scaleToFit () {
    if (this.state.graph != null) {
      this.setState({
        transform: this.getFittingTransform(this.state.graph)
      })
    }
  }

  handleMouseMove (event) {
    const boundingRect = findDOMNode(this._graph).getBoundingClientRect()
    const posX = boundingRect.left
    const posY = boundingRect.top
    this.setState({ mousePosition: { x: event.clientX - posX, y: event.clientY - posY } })

    if (this.state.mouseDown) {
      this.setState({
        transform: translate(
          (event.clientX - this.state.moveStartPosition.x) / this.state.transform[2],
          (event.clientY - this.state.moveStartPosition.y) / this.state.transform[2],
          this.state.transform),
        moveStartPosition: {
          x: event.clientX,
          y: event.clientY
        }
      })
    }
  }

  handleMouseDown (event) {
    this.setState({
      mouseDown: true,
      moveStartPosition: {
        x: event.clientX,
        y: event.clientY
      }
    })
  }

  handleMouseUp (event) {
    this.setState({
      mouseDown: false
    })
  }

  handleMouseWheel (event) {
    const [ offsetX, offsetY, scale ] = this.state.transform
    const mouse = this.state.mousePosition

    event.preventDefault()
    const zoomFactor = event.deltaY < 0 ? 0.9 : 1.1
    const zoom = scale - scale * zoomFactor
    const K = scale * scale + scale * zoom
    this.setState({
      transform: [
        offsetX - (mouse.x * zoom) / K,
        offsetY - (mouse.y * zoom) / K,
        scale + zoom
      ]
    })
  }

  render () {
    const { kgraph, style, ...other } = this.props
    const { graph, transform } = this.state

    return (
      <Graph
        ref={this.setGraph}
        style={{ ...styles.container, ...style }}
        translateX={transform[0]}
        translateY={transform[1]}
        scale={transform[2]}
        onMouseMove={(event) => this.handleMouseMove(event)}
        onMouseDown={(event) => this.handleMouseDown(event)}
        onMouseUp={(event) => this.handleMouseUp(event)}
        onWheel={(event) => this.handleMouseWheel(event)}
        graph={graph}
        {...other}
      />
    )
  }
}
