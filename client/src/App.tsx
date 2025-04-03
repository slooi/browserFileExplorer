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
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "auto 1fr auto", marginBottom: "0.5rem" }}>

        {/* HEADER LEFT  */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1 onClick={() => window.location.href = getParentDirectory()}>File Navigator</h1>
          <h2 style={{ marginLeft: "1rem" }}><a href={getParentDirectory()}>../</a></h2>
        </div>

        {/* HEADER RIGHT  */}
        <form onSubmit={
          e => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            console.log('formData.get("title")', formData.get("title"))
            const title = formData.get("title")
            if (typeof title === "string") {
              fetch("/api/dl", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ title })
              }).then(res => console.log(res)).catch(err => alert(err))
            } else {

            }
          }
        }
          style={{ display: "flex", width: "100%" }}
        >
          <input type="text" name="title" style={{ height: "100%", width: "100%" }} autoComplete='off' />
          <button>submit</button>
        </form>

        <button onClick={() => window.scrollTo(0, 999999999)} style={{ width: "10rem" }}>down</button>
      </div >
      <h3>{getNameOfDir()}</h3>

      {/* FOLDERS */}
      < div className='dir-grid' >
        {dirs && dirs.map((dir, index) => <DirCard key={index} dir={dir} />)
        }
      </div >

      <h2>Files</h2>
      {/* FILES */}
      <div
        style={{ display: "flex", flexDirection: "column" }}
        onClick={(e) => {
          let targetElement = e.target as HTMLElement
          if (!(targetElement.nodeName === "IMG")) return
          targetElement = targetElement as HTMLImageElement

          const tapProportion = e.clientX / targetElement.getBoundingClientRect().width
          console.log(tapProportion)
          const img = e.target as HTMLImageElement

          if (img.parentElement) {
            if (tapProportion > 0.5) {
              const elements = [...img.parentElement.children]
              for (let i = 0; i < elements.length; i++) {
                const distanceFromTopOfScreen = elements[i].getBoundingClientRect().top
                if (distanceFromTopOfScreen > 5) {
                  window.scrollBy(0, distanceFromTopOfScreen + 2)
                  return
                }
              }
            } else {
              const elements = [...img.parentElement.children]
              for (let i = 0; i < elements.length; i++) {
                const targetElement = elements[i]
                let distanceFromTopOfScreen = targetElement.getBoundingClientRect().top
                if (distanceFromTopOfScreen > -5) {
                  if (targetElement.previousElementSibling) {
                    distanceFromTopOfScreen = targetElement.previousElementSibling.getBoundingClientRect().top
                    window.scrollBy(0, distanceFromTopOfScreen + 2)
                    return
                  }
                }
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
        <button style={{ width: "100%", height: "2rem" }} onClick={() => window.location.href = getParentDirectory()}>../</button>
        <button style={{ width: "100%", height: "2rem" }} onClick={() => window.scrollTo(0, 0)}>up</button>
        {/* </a> */}
      </div>
    </>
  )
}

export default App
