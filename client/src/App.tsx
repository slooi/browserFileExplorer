import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'

function App() {
  const [data, setData] = useState<null | DirItem[]>(null)


  async function fetchItems(path: string = "") {
    const res = await fetch("/api?path=" + path)
    const json = await res.json()
    console.log(json)
    setData(json)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <>
      <h1>asd</h1>
      <ul>
        {data && data.map(item => {
          return <li key={item.itemName} className={"clickable"} onClick={() =>
            fetchItems(item.fullPath)}><a href="#">{item.itemName}</a></li>
        })}
      </ul>
    </>
  )
}

export default App
