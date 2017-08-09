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

function getPath (e, padding, startsAtParent = false) {
  let path
  if (startsAtParent) {
    path = 'M ' + e.sourcePoint.x + ' ' + e.sourcePoint.y + ' '
  } else {
    path = 'M ' + (e.sourcePoint.x + padding.left) + ' ' + (e.sourcePoint.y + padding.top) + ' '
  }
  var bendPoints = e.bendPoints || []
  bendPoints.forEach((bp, i) => {
    path += 'L ' + (bp.x + padding.left) + ' ' + (bp.y + padding.top) + ' '
  })
  path += 'L ' + (e.targetPoint.x + padding.left) + ' ' + (e.targetPoint.y + padding.top - 10) + ' '
  return path
}

function Edge ({ graph, parentNode, edge, padding = { top: 0, left: 0 }, ...other }) {
  const endPoint = edge.targetPoint
  const previousPoint = edge.bendPoints != null && edge.bendPoints.length > 0
    ? edge.bendPoints[edge.bendPoints.length - 1]
    : (edge.source === parentNode.id ? { x: edge.sourcePoint.x - padding.left, y: edge.sourcePoint.y - padding.top } : edge.sourcePoint)
  const angle = Math.atan2(endPoint.y - previousPoint.y, endPoint.x - previousPoint.x) * 180 / Math.PI
  const color = (edge.meta && edge.meta.style && edge.meta.style.color) || '#333333'

  return (
    <g>
      <path
        strokeWidth={3}
        opacity={0.8}
        fill='none'
        stroke={color}
        d={getPath(edge, padding, edge.source === parentNode.id)}
        {...other}
      />
      <path
        strokeWidth={3}
        opacity={0.8}
        fill={color}
        d='M0,0 L0,3 L3,1.5 L0,0'
        transform={`translate(${edge.targetPoint.x + padding.left + 4.5} ${edge.targetPoint.y + padding.top - 10}) rotate(${angle}) scale(3)`}
      />
    </g>
  )
}

function Node ({ graph, node, ...other }) {
  const transform = `translate(${(node.x || 0) + (node.padding ? node.padding.left : 0)} ${(node.y || 0) + (node.padding ? node.padding.top : 0)})`

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
            padding={node.padding}
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
    <g transform={`translate(${-node.padding.left} ${-node.padding.top})`}>
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

export default function Graph ({ graph, translateX = 1, translateY = 1, scale = 1, ...other }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={graph.width - graph.padding.left - graph.padding.right}
      height={graph.height - graph.padding.top - graph.padding.bottom}
      {...other}
    >
      <g transform={`scale(${scale}) translate(${translateX} ${translateY})`}>
        <RootNode
          graph={graph}
          node={graph}
        />
      </g>
    </svg>
  )
}
