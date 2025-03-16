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
      <h1>File Navigator</h1>
      <ul style={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start" }}>
        {data && data.map(item => {
          if (item.type === "dir") return <li
            key={item.itemName}
            className={"clickable"}
            onClick={() => handleClick(item)}
          >
            <a href="#">{item.itemName}</a>
          </li>
          if (item.type === "file") return <img loading="lazy" src={"/api" + item.publicPath} />
        }
        )}
      </ul>
    </>
  )
}

export default App
