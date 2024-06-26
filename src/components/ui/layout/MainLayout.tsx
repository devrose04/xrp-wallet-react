import { ReactNode } from "react"

interface PropStruct {
  children: ReactNode
}

const MainLayout: React.FC<PropStruct> = ({ children }) => {
  return (
    <>
      <div className=" w-full min-h-screen" >
        {children}
      </div>
    </>
  )
}

export default MainLayout