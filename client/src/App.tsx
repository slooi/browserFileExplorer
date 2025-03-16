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

  useEffect(() => { fetchDirItems(window.location.pathname) }, [])

  return (
    <>
      <h1>File Navigator</h1>
      <ul style={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start", width: "100%" }}>
        {data && data.map(item => {
          if (item.type === "dir") return <li
            key={item.itemName}
          >
            <a href={encodeURIComponent(item.publicPath)} onClick={() => { }}>{item.itemName}</a>
          </li>
          if (item.type === "file") return <img style={{ maxWidth: "100%" }} src={"/api/" + encodeURIComponent(item.publicPath)} />
        }
        )}
      </ul>
    </>
  )
}

export default App
