/** @jsxRuntime classic */
import {jsx} from 'react'
import WZReact from './WZReact.js'


/** @jsx WZReact.createElement */
// const container = document.getElementById("root")

// const updateValue = e => {
//   rerender(e.target.value)
// }

// const rerender = value => {
//   const element = (
//     <div>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello {value}</h2>
//     </div>
//   )
//   WZReact.render(element, container)
// }

// rerender("World")


function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById("root")
WZReact.render(element, container)