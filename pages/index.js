import { ethers } from "ethers"
import { useState, useEffect } from "react"
import axios from "axios"
import Web3Modal from 'web3modal'
import { nftmarketaddress, nftaddress } from "../config"
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'


const Home = () => {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState('not-loaded')

  useEffect(() => {
    loadNfts()
  }, [])

  const loadNfts = async () => {

    const provider = new ethers.providers.getDefaultProvider("https://rinkeby.infura.io/v3/15c1d32581894b88a92d8d9e519e476c")

    const tokenContract = new ethers.Contract(
      nftaddress, 
      NFT.abi, 
      provider
    )

    const marketContract = new ethers.Contract(
      nftmarketaddress, 
      Market.abi, 
      provider
    )

    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), "ether")
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      console.log(item)
      return item
    }))
    setNfts(items)
    setLoading('loaded')
  }

  const buyNft = async (nft) => {
    console.log(nft)
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price
      }
    )
    await transaction.wait()
    loadNfts()
  }


  if (loading === 'loaded' && !nfts.length) {
    return (
      <h1 className=" px-20 text-3xl">No items in marketplace</h1>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{maxwidth: "1600px"}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => {
            return (
              <div key={i} className=" border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="w-full p-5 " />
                <div className="p-4">
                  <p style={{height: "64px"}} className="text-2xl font-semibold">
                    {nft.name}
                  </p>
                  <div style={{height: "70px", overflow: "hidden"}}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} ETH
                  </p>
                  <button className="w-full bg-gray-400 text-black font-bold py-2 px-12 rounded"
                   onClick={() => {buyNft(nft)}}>
                    Buy
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Home