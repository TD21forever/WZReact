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


// function App(props) {
//   return <h1>Hi {props.name}</h1>
// }
// const element = <App name="foo" />
// const container = document.getElementById("root")

function App(props){
  return <h1>{props.text}</h1>
}

const element1 = (
  <App text="11111"/>
)

const element2 = (
    <App text="2222"/>
)

const element3 = (

    <App text="3333" />

)

const container = document.getElementById('root')
const button1 = document.getElementById('button')
button1.addEventListener('click', onClick)


let n = 0
function onClick() {
  console.log("=========================================================================================================")
  if (n === 0) {
    WZReact.render(element1, container)
  } else if (n === 1) {
    WZReact.render(element2, container)
  } else {
    WZReact.render(element3, container)
  }
  n = (n + 1) % 3
}

// WZReact.render(element, container)