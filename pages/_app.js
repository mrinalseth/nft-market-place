import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <div className=" mb-7 w-full flex flex-row align-middle p-5 bg-gray-100">
        <p className=" font-extrabold font-mono text-4xl hover:cursor-pointer">Heading</p>
        <div className="ml-5  mt-auto">
        <Link href={"/"}><a className="mr-6 text-gray-500">
          Home
        </a></Link>

        <Link href={"/create-item"}><a className="mr-6 text-gray-500">
          Sell NFTs
        </a></Link>

        <Link href={"/my-assets"}><a className="mr-6 text-gray-500">
          My NFTs
        </a></Link>

        <Link href={"/creator-dashboard"}><a className="mr-6 text-gray-500">
          Creator Dashboard
        </a></Link>

      </div>
      </div>
      <Component {...pageProps}/>
    </div>
  )
}

export default MyApp
