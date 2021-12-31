import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Contract from './artifacts/contracts/Raffle.sol/Raffle.json';
import './App.css';

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const tokens = require('./tokens.json');

const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {

  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState();

  useEffect(() => {
    requestAccount();
    getPrice();
  }, [])

  async function requestAccount() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccounts(accounts);
    }
  }

  async function getPrice() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(address, Contract.abi, provider);
      try {
        const data = await contract.getPrice();
        setPrice(data);
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  async function mint() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, Contract.abi, signer);

      let tab = [];
      tokens.map(token => {
        tab.push(token.address)
      })

      const leaves = tab.map(v => keccak256(v));
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      const leaf = keccak256(accounts[0]);
      const proof = tree.getHexProof(leaf);

      try {
        let overrides = {
          from: accounts[0],
          value: price
        }
        const transaction = await contract.mintNFT(accounts[0], proof, overrides);
        await transaction.wait();
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="App">
      <button onClick={mint}>MINT ONE NFT</button>
    </div>
  );
}

export default App;
