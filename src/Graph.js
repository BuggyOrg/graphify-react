import React from 'react'
import { isCompound } from './graphUtil'

function isOutputPort ({ id }) {
  return /.+_out$/.test(id)
}

function Port ({ graph, port }) {
  return (
    <rect
      x={port.x}
      y={port.y}
      width={port.width}
      height={port.height}
      stroke='#000'
      fill={isOutputPort(port) ? 'black' : 'white'}
    />
  )
}

function getPath (e, startsAtParent = false) {
  const section = e.sections[0]
  const bendPoints = section.bendPoints || []

  let path = `M ${section.startPoint.x} ${section.startPoint.y} `
  bendPoints.forEach((bp, i) => {
    path += `L ${bp.x} ${bp.y} `
  })
  path += `L ${section.endPoint.x} ${section.endPoint.y - 10}`
  return path
}

function Edge ({ graph, parentNode, edge, ...other }) {
  const section = edge.sections[0]
  const endPoint = section.endPoint
  const previousPoint = section.bendPoints != null && section.bendPoints.length > 0
    ? section.bendPoints[section.bendPoints.length - 1]
    : (edge.source === parentNode.id ? { x: section.startPoint.x, y: section.startPoint.y } : section.startPoint)

  const angle = Math.atan2(endPoint.y - previousPoint.y, endPoint.x - previousPoint.x) * 180 / Math.PI
  const color = (edge.meta && edge.meta.style && edge.meta.style.color) || '#333333'

  return (
    <g>
      <path
        strokeWidth={3}
        opacity={0.8}
        fill='none'
        stroke={color}
        d={getPath(edge, edge.source === parentNode.id)}
        {...other}
      />
      <path
        strokeWidth={3}
        opacity={0.8}
        fill={color}
        d='M0,0 L0,3 L3,1.5 L0,0'
        transform={`translate(${endPoint.x + 4.5} ${endPoint.y - 10}) rotate(${angle}) scale(3)`}
      />
    </g>
  )
}

function Node ({ graph, node, ...other }) {
  const transform = `translate(${(node.x || 0)} ${(node.y || 0)})`

  if (isCompound(node, graph)) {
    return (
      <g
        transform={transform}
      >
        <rect
          {...other}
          strokeWidth={1}
          width={node.width}
          height={node.height}
          strokeOpacity={0.5}
          strokeDasharray='10 5'
          fillOpacity={0}
          transform='translate(0.5 0.5)'
          stroke={(node.meta && node.meta.style && node.meta.style.color) || '#000'}
        />
        <text
          x={5}
          y={5}
          alignmentBaseline='hanging'
          fontFamily='sans-serif'
          fontSize={14}
          fill={(node.meta && node.meta.style && node.meta.style.color) || null}
          opacity={0.5}
        >
          {node.text}
        </text>
        {Array.isArray(node.edges) && node.edges.map((edge) => (
          <Edge
            key={`e-${edge.source}@${edge.sourcePort}-${edge.target}@${edge.targetPort}`}
            graph={graph}
            parentNode={node}
            edge={edge}
          />
        ))}
        {Array.isArray(node.ports) && node.ports.map((port) => (
          <Port
            key={`p-${port.id}`}
            graph={graph}
            port={port}
          />
        ))}
        {Array.isArray(node.children) && node.children.map((child) => (
          <Node
            key={`c-${child.id}`}
            graph={graph}
            node={child}
          />
        ))}
      </g>
    )
  } else {
    return (
      <g
        transform={transform}
      >
        <rect
          {...other}
          strokeWidth={3}
          width={node.width}
          height={node.height}
          stroke={(node.meta && node.meta.style && node.meta.style.color) || '#000'}
          fill='#fff'
        />
        <text
          x={node.width / 2}
          y={node.height / 2}
          textAnchor='middle'
          alignmentBaseline='central'
          fontFamily='sans-serif'
          fontSize={14}
          fill={(node.meta && node.meta.style && node.meta.style.color) || null}
        >
          {node.text}
        </text>
        {Array.isArray(node.ports) && node.ports.map((port) => (
          <Port
            key={`p-${port.id}`}
            graph={graph}
            port={port}
          />
        ))}
      </g>
    )
  }
}

function RootNode ({ graph, node }) {
  return (
    <g>
      {Array.isArray(node.edges) && node.edges.map((edge) => (
        <Edge
          key={`e-${edge.source}-${edge.target}`}
          graph={graph}
          parentNode={node}
          edge={edge}
        />
      ))}
      {Array.isArray(node.ports) && node.ports.map((port) => (
        <Port
          key={`p-${port.id}`}
          graph={graph}
          port={port}
        />
      ))}
      {Array.isArray(node.children) && node.children.map((child) => (
        <Node
          key={`c-${child.id}`}
          graph={graph}
          node={child}
        />
      ))}
    </g>
  )
}

export default class Graph extends React.Component {
  render () {
    const { graph, translateX = 1, translateY = 1, scale = 1, ...other } = this.props
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={graph != null ? graph.width : 0}
        height={graph != null ? graph.height : 0}
        {...other}
      >
        <g transform={`scale(${scale}) translate(${translateX} ${translateY})`}>
          {graph != null && <RootNode
            graph={graph}
            node={graph}
          />}
        </g>
      </svg>
    )
  }
}
