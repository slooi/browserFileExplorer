import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'

function App() {
  const [data, setData] = useState<null | DirItem[]>(null)


  async function fetchDirItems(path: string) {
    const apiPath = "/api" + path
    console.log("apiPath", apiPath)
    const res = await fetch(apiPath)
    const json = await res.json()
    console.log(json)
    setData(json)
  }

  const getParentDirectory = () => {
    const dir = window.location.pathname.split(/\/|\%2F/g).slice(0, -1).filter(Boolean).join("/")
    console.log(dir)
    return dir || "/"
  }

  useEffect(() => { fetchDirItems(window.location.pathname) }, []) // encodeURIComponent  ???

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>File Navigator</h1>
        <div style={{ margin: "0 1rem" }}>
          <ul>
            <li><h2><a href={getParentDirectory()}>../</a></h2></li>
          </ul>
        </div>
      </div>
      <ul style={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start", width: "100%" }}>
        {data && data.map(item => {
          if (item.type === "dir") return <li
            key={item.itemName}
          >
            <a href={encodeURIComponent(item.publicPath)} onClick={() => { }}>{item.itemName}</a>
          </li>
          if (item.type === "file") return <img src={"/api/" + encodeURIComponent(item.publicPath)}
            style={{ width: "100%" }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              const parent = img.parentElement
              if (parent === null) throw new Error("ERROR PARENT NULL")
              img.style.width = `${parent.clientWidth}px`; // Set width to current 100% width in pixels
            }} />
        }
        )}
      </ul>
    </>
  )
}

export default App
