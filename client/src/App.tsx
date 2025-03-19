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
      <div
        style={{ display: "flex", flexDirection: "column" }}
        onClick={(e) => {
          console.log(e.target)
          const img = e.target as HTMLImageElement

          if (img.parentElement) {
            const elements = [...img.parentElement.children]
            for (let i = 0; i < elements.length; i++) {
              const distanceFromTopOfScreen = elements[i].getBoundingClientRect().top
              // console.log(distanceFromTopOfScreen)
              console.log("distanceFromTopOfScreen", distanceFromTopOfScreen)
              if (distanceFromTopOfScreen > 5) {
                window.scrollBy(0, distanceFromTopOfScreen)
                return
              }
            }
          }
        }}
      >
        {
          files && files.map(file => (
            <img src={"/api/" + encodeURIComponent(file.publicPath)}
              className='file'
            />
          ))
        }
      </div>

      <div style={{ height: "10rem", backgroundColor: "black" }}>
        {/* <a > */}
        <button className='button' style={{ width: "100%" }} onClick={() => window.location.href = getParentDirectory()}><h2>../</h2></button>
        <button className='button' style={{ width: "100%" }} onClick={() => window.scrollTo(0, 0)}><h2>up</h2></button>
        {/* </a> */}
      </div>
    </>
  )
}

export default App
