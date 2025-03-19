import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'
import DirCard from './DirCard'

function App() {
  const [data, setData] = useState<null | DirItem[]>(null)

  useEffect(() => { fetchDirItems(window.location.pathname) }, []) // encodeURIComponent  ???

  async function fetchDirItems(path: string) {
    const apiPath = "/api/" + path.replace(/^\/|^\%2F/, "")
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

  const getNameOfDir = () => decodeURIComponent(window.location.pathname.split(/\/|\%2F/g).filter(Boolean).pop() || "")

  const files = data && data.filter(item => item.type === "file")
  const dirs = data && data.filter(item => item.type === "dir")

  return (
    <>
      {/* HEADER */}
      <div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1 onClick={() => window.location.href = getParentDirectory()}>File Navigator</h1>
          <ul style={{ margin: "0 1rem" }}>
            <li><h2><a href={getParentDirectory()}>../</a></h2></li>
          </ul>
        </div>
        <h3 >{getNameOfDir()}</h3>
      </div>

      {/* FOLDERS */}
      <div className='dir-grid'>
        {dirs && dirs.map((dir, index) => <DirCard key={index} dir={dir} />)}
      </div>

      <h2>Files</h2>
      {/* FILES */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {
          files && files.map(file => (
            <img src={"/api/" + encodeURIComponent(file.publicPath)}
              className='file'
              onClick={(e) => {
                const img = e.target as HTMLImageElement
                if (img.nextElementSibling) window.scrollBy(0, img.nextElementSibling?.getBoundingClientRect().top)
              }}
            />
          ))
        }
      </div>

      <div style={{ height: "10rem", backgroundColor: "black" }}>
        <a href={getParentDirectory()}>
          <button className='button' style={{ width: "100%" }}><h2>../</h2></button>
        </a>
      </div>
    </>
  )
}

export default App
