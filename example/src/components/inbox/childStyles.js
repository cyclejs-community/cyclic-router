const containerStyle = {
  zIndex: '100',
  position: 'absolute',
  top: '0',
  bottom: '0',
  right: '0',
  left: '0',
  marginLeft: '15em',
  backgroundColor: "#cccccc",
  borderLeft: '1px solid rgba(34, 34, 34, 0.4)',
  transform: "translate3d(25em, 0, 0)",
  delayed: {
    transition: "transform 500ms",
    transform: "translate3d(0, 0, 0)",
  },
  remove: {
    transition: "transform 200ms",
    transform: "translate3d(100em, 0, 0)",
  },
}

export {containerStyle}
