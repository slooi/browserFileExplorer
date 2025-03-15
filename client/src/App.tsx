import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'

function App() {
  const [data, setData] = useState<null | DirItem[]>(null)


  async function fetchDirItems(path: string = "") {
    const res = await fetch("/api?path=" + encodeURIComponent(path))
    const json = await res.json()
    console.log(json)
    setData(json)
  }

  async function fetchFile(download: string) {
    window.open("api?path=" + encodeURIComponent(download), "_blank")
  }

  function handleClick(item: DirItem) {
    if (item.type === "dir") {
      fetchDirItems(item.fullPath)
    } else if (item.type === "file") {
      fetchFile(item.fullPath)
    } else {
      throw new Error("UNEXPECTED ITEM TYPE")
    }
  }

  useEffect(() => {
    fetchDirItems()
  }, [])

  return (
    <>
      <h1>asd</h1>
      <ul>
        {data && data.map(item => (
          <li
            key={item.itemName}
            className={"clickable"}
            onClick={() => handleClick(item)}
          >
            <a href="#">{item.itemName}</a>
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
