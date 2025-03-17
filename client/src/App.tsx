import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'
import DirCard from './DirCard'

function App() {
  const [data, setData] = useState<null | DirItem[]>(null)

  useEffect(() => { fetchDirItems(window.location.pathname) }, []) // encodeURIComponent  ???

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

  const files = data?.filter(item => item.type === "file")
  const dirs = data?.filter(item => item.type === "dir")

  return (
    <>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>File Navigator</h1>
        <div style={{ margin: "0 1rem" }}>
          <ul>
            <li><h2><a href={getParentDirectory()}>../</a></h2></li>
          </ul>
        </div>
      </div>

      {/* FOLDERS */}
      <div className='dir-grid'>
        {dirs && dirs.map((dir, index) => <DirCard key={index} dir={dir} />)}
      </div>

      {/* FILES */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {
          files && files.map(file => (
            <img src={"/api/" + encodeURIComponent(file.publicPath)}
              style={{ width: "100%" }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                const parent = img.parentElement
                if (parent === null) throw new Error("ERROR PARENT NULL")
                img.style.width = `${parent.clientWidth}px`; // Set width to current 100% width in pixels
              }}
              onClick={(e) => {
                const img = e.target as HTMLImageElement
                if (img.nextElementSibling) window.scrollBy(0, img.nextElementSibling?.getBoundingClientRect().top)
              }}
            />
          ))
        }
      </div>
    </>
  )
}

export default App
