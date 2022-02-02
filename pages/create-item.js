import { useState } from "react";
import { ethers } from "ethers";
import {create as ipfsHttpClient} from 'ipfs-http-client'
import { useRouter } from "next/router";
import Web3Modal from 'web3modal'
import { nftmarketaddress, nftaddress } from "../config"
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')



const CreateItem = () => {

    const [fileUrl, setFileUrl] = useState(null)
    const [msg, setMsg] = useState("Create Digital Asset")
    const [formInput, setFormInput] = useState({
        price: "",
        name: "",
        description: ""
    })

    const router = useRouter()

    const onChange = async (e) => {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            console.log(url)
            setFileUrl(url)
        }catch(err) {
            console.log(err)
        }
    }

    const createItem = async () => {
        setMsg("Loading...")
        const {name, price, description} = formInput
        if (!name || !description || !price || !fileUrl) {
            return
        }
        const data = JSON.stringify({
            name,
            description, 
            image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
            
        }catch (err) {
            console.log(err)
        }
    }

    const createSale = async (url) => {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        transaction = await contract.createMarketItem(
            nftaddress, tokenId, price, {value: listingPrice}
        )
        await transaction.wait()
        setMsg("Create Digital Asset")
        router.push('/')
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input 
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    value={formInput.name}
                    onChange={(e) => {setFormInput({
                        ...formInput,
                        name: e.target.value
                    })}}
                />
                <textarea 
                    placeholder="Description"
                    className="mt-12 border rounded p-4"
                    value={formInput.description}
                    onChange={(e) => {setFormInput({
                        ...formInput, 
                        description: e.target.value
                    })}}
                />
                <input 
                    placeholder="Asset price in ETH"
                    className="mt-2 border rounded p-4"
                    value={formInput.price}
                    onChange={(e) => {setFormInput({
                        ...formInput,
                        price: e.target.value
                    })}}
                />
                <input 
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileUrl && (
                        <img src={fileUrl} className="rounded mt-4" width="350" />
                    )
                }
                <button
                onClick={createItem}
                className="font-bold mt-4 bg-gray-900
                text-white rounded p-4 shadow-lg"

                >{msg}</button>
            </div>
        </div>
    )
}

export default CreateItem;