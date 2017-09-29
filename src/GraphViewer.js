import * as React from 'react'
import { findDOMNode } from 'react-dom'
import GraphLayouter from './GraphLayouter'

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
      transform: [0, 0, 1],
      mouseDown: false,
      moveStartPosition: null
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
    const { kgraph, ...other } = this.props
    const { transform } = this.state

    return (
      <GraphLayouter
        ref={(graph) => { this._graph = graph }}
        style={{ ...styles.container, ...this.props.style }}
        translateX={transform[0]}
        translateY={transform[1]}
        scale={transform[2]}
        onMouseMove={(event) => this.handleMouseMove(event)}
        onMouseDown={(event) => this.handleMouseDown(event)}
        onMouseUp={(event) => this.handleMouseUp(event)}
        onWheel={(event) => this.handleMouseWheel(event)}
        kgraph={kgraph}
        {...other}
      />
    )
  }
}
