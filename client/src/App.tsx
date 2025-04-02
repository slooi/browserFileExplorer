import { useEffect, useState } from 'react'
import './App.css'
import { DirItem } from './types'
import DirCard from './DirCard'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { pathHelper } from './pathHelper'

function FileNavigator() {
  const { "*": path } = useParams() //!@#!@#!@# `path` unlike `window.loation.pathname` does not have the leading "/" 
  const [pageScroll, setPageScroll] = useState<{ [key: string]: number | undefined }>({})
  console.log("###### path", path)
  const [data, setData] = useState<null | DirItem[]>(null)
  const navigate = useNavigate()


  const handleScroll = (e: Event) => {
    console.log("!!!!! window.scrollY", window.scrollY)
    setPageScroll(pageScroll => ({
      ...pageScroll,
      [window.location.pathname]: window.scrollY
    }))
  }

  useEffect(() => {
    async function fetchData() {
      await fetchDirItems(window.location.pathname)
      const scrollY = pageScroll[window.location.pathname] || 0
      window.scrollTo(0, scrollY);
      console.log("!!!!! set scrollY", scrollY)
    }
    fetchData()

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      // console.log(`${window.location.pathname} ################################ window.scrollY`, window.scrollY)
      // console.log(`${window.location.pathname} ################################ test`, test)
      // setTest(window.scrollY)
    }
  }, [path]) // encodeURIComponent  ???

  async function fetchDirItems(path: string) {
    const apiPath = "/api/" + path.replace(/^\/|^\%2F/, "")
    console.log("apiPath", apiPath)
    const res = await fetch(apiPath)
    const json = await res.json()
    console.log(json)
    setData(json)
  }

  const getParentDirectory = () => {
    // alert(window.location.pathname)
    const dir = pathHelper.setLeadingSlash(window.location.pathname.split(/\/|\%2F/g).slice(0, -1).filter(Boolean).join("/")) || "/"
    // alert(dir)
    console.log("getParentDirectory func. dir:", dir)
    return dir
  }

  const returnToParentDirectory = () => {
    navigate("..", { relative: "path" })
  }

  const getNameOfDir = () => decodeURIComponent(window.location.pathname.split(/\/|\%2F/g).filter(Boolean).pop() || "")

  const files = data && data.filter(item => item.type === "file")
  const dirs = data && data.filter(item => item.type === "dir")

  return (
    <>
      {/* HEADER */}
      <div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1 onClick={() => returnToParentDirectory()}>File Navigator</h1>
          <ul style={{ margin: "0 1rem" }}>
            <li><h2><Link to={{ pathname: ".." }} relative="path">../</Link></h2></li>
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
        <button className='button' style={{ width: "100%" }} onClick={() => returnToParentDirectory()}><h2>../</h2></button>
        <button className='button' style={{ width: "100%" }} onClick={() => window.scrollTo(0, 0)}><h2>up</h2></button>
      </div>
    </>
  )
}

const App = function () {
  return (
    <Routes>
      <Route path="*" element={<FileNavigator />} />
    </Routes>
  )
}

export default App
