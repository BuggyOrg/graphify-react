export function getNode (id, graph) {
  if (graph.id === id) {
    return graph
  }

  const node = (graph.children || []).find((n) => n.id === id)
  if (node) {
    return node
  } else {
    for (let i = 0; i < (graph.children || []).length; i++) {
      const result = getNode(id, graph.children[i])
      if (result) {
        return result
      }
    }
  }
}

export function hasChildren (node, graph) {
  node = getNode(node.id, graph)
  return node.children && node.children.length > 0
}

export function hasEdges (node, graph) {
  node = getNode(node.id, graph)
  return node.edges && node.edges.length > 0
}

export function isCompound (node, graph) {
  return hasChildren(node, graph) || hasEdges(node, graph)
}
