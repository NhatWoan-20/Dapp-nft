// src/App.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MyNFT_ABI from './utils/MyNFT.json';
import './App.css';

// ==================================================================
// !!! CẬP NHẬT 2 GIÁ TRỊ NÀY !!!
// Dán địa chỉ hợp đồng của SV từ Bước 1.3
const contractAddress = "0x27A37EeA49b22E9Ba7D46B2b7A8b4D3A868DBCFd"; 
// Dán URL metadata của SV từ Bước 1.1
const metadataURI = "https://gateway.pinata.cloud/ipfs/bafkreifpmtkv7md5ljf43lywhzf5xw6jul3llzq5q7mxinpqrbuqf2buoa";
// ==================================================================

const MINT_PRICE = "0.001";
const MAX_SUPPLY = 100;

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [mintingStatus, setMintingStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [totalMinted, setTotalMinted] = useState(0);
  const [loading, setLoading] = useState(false);

  const [tokenIdInput, setTokenIdInput] = useState("");
  const [nftData, setNftData] = useState(null);
  const [loadingNFT, setLoadingNFT] = useState(false);
  const [loadNFTStatus, setLoadNFTStatus] = useState(null);

  // Kết nối ví
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWalletAddress(accounts[0]);
  }

  // Lấy tổng supply
  async function fetchTotalSupply() {
    if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, MyNFT_ABI, provider);

    try {
      const supply = await contract.totalSupply();
      setTotalMinted(Number(supply));
    } catch (err) {
      console.error("Error fetching supply:", err);
    }
  }

  useEffect(() => {
    fetchTotalSupply();
  }, []);

  // Mint NFT
  async function handleMint() {
    if (!walletAddress) {
      alert("Connect wallet first");
      return;
    }

    if (totalMinted >= MAX_SUPPLY) {
      alert("Sold Out");
      return;
    }

    try {
      setLoading(true);
      setMintingStatus("Confirm transaction in MetaMask...");
      setTxHash(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, MyNFT_ABI, signer);

      const tx = await contract.safeMint(
        walletAddress,
        metadataURI,
        {
          value: ethers.utils.parseEther(MINT_PRICE)
        }
      );

      setMintingStatus("Waiting for confirmation...");
      await tx.wait();

      setMintingStatus("Mint successful!");
      setTxHash(tx.hash);

      await fetchTotalSupply();
    } catch (error) {
      console.error(error);
      setMintingStatus(`Mint failed: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Load NFT theo tokenId
  async function handleLoadNFT() {
    if (tokenIdInput === "") {
      alert("Please enter a tokenId");
      return;
    }

    try {
      setLoadingNFT(true);
      setLoadNFTStatus(null);
      setNftData(null);

      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, MyNFT_ABI, provider);

      // Kiểm tra token có tồn tại không bằng cách gọi ownerOf
      try {
        await contract.ownerOf(tokenIdInput);
      } catch {
        setLoadNFTStatus("Token does not exist.");
        return;
      }

      // Lấy tokenURI
      const tokenURI = await contract.tokenURI(tokenIdInput);

      if (!tokenURI) {
        setLoadNFTStatus("Token exists but has no metadata URI.");
        return;
      }

      // Fetch metadata
      const response = await fetch(tokenURI);
      if (!response.ok) {
        throw new Error("Cannot fetch metadata JSON");
      }

      const metadata = await response.json();

      let imageUrl = metadata.image || "";

      if (imageUrl.startsWith("ipfs://")) {
        imageUrl = imageUrl.replace(
          "ipfs://",
          "https://gateway.pinata.cloud/ipfs/"
        );
      }

      setNftData({
        name: metadata.name || `NFT #${tokenIdInput}`,
        description: metadata.description || "No description",
        image: imageUrl,
      });

      setLoadNFTStatus("NFT loaded successfully");
    } catch (error) {
      console.error("Load NFT failed:", error);
      setLoadNFTStatus("Failed to load NFT. Invalid tokenId or metadata error.");
    } finally {
      setLoadingNFT(false);
    }
  }

  const remaining = MAX_SUPPLY - totalMinted;
  const soldOut = totalMinted >= MAX_SUPPLY;

  return (
    <div className="App">
      <header className="App-header">
        <h1>My NFT Collection</h1>

        <button onClick={connectWallet} className="connect-button">
          {walletAddress
            ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
            : "Connect Wallet"}
        </button>

        <div className="info-box">
          <p><strong>Mint Price:</strong> {MINT_PRICE} ETH</p>
          <p><strong>Total Minted:</strong> {totalMinted} / {MAX_SUPPLY}</p>
          <p><strong>Remaining:</strong> {remaining}</p>
        </div>

        {walletAddress && (
          <div className="mint-container">
            <button
              onClick={handleMint}
              disabled={soldOut || loading}
              className="mint-button"
            >
              {soldOut ? "Sold Out" : loading ? "Processing..." : "Mint NFT"}
            </button>

            {mintingStatus && (
              <p className="status-text">{mintingStatus}</p>
            )}

            {txHash && (
              <p>
                View Transaction:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Etherscan
                </a>
              </p>
            )}
          </div>
        )}

        <hr style={{ width: "80%", margin: "40px 0" }} />

        <div className="nft-loader">
          <h2>Load NFT by Token ID</h2>

          <input
            type="number"
            min="0"
            placeholder="Enter tokenId"
            value={tokenIdInput}
            onChange={(e) => setTokenIdInput(e.target.value)}
            className="token-input"
          />

          <button
            onClick={handleLoadNFT}
            disabled={loadingNFT}
            className="mint-button"
          >
            {loadingNFT ? "Loading..." : "Load NFT"}
          </button>

          {loadNFTStatus && (
            <p className="status-text">{loadNFTStatus}</p>
          )}

          {nftData && (
            <div className="nft-card" style={{ marginTop: "24px" }}>
              <h3>{nftData.name}</h3>
              {nftData.image && (
                <img
                  src={nftData.image}
                  alt={nftData.name}
                  style={{
                    width: "280px",
                    maxWidth: "100%",
                    borderRadius: "12px",
                    marginTop: "12px"
                  }}
                />
              )}
              <p style={{ marginTop: "12px" }}>{nftData.description}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;