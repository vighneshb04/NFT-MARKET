import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, User, Wallet, Grid, TrendingUp, Star, Heart, Eye, Zap, Shield, Globe, Settings, Bell, X, Plus, Filter, Share2, Download, ExternalLink } from 'lucide-react';
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";

// Import your new ABIs
import MyNFTAbi from '../abi/MyNFT_ABI.json';
import NFTMarketplaceAbi from '../abi/NFTMarketplace_ABI.json';

import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore";


// --- Contract Addresses ---
// REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESSES ON SEPOLIA!
const MY_NFT_CONTRACT_ADDRESS = "0x5a7114f4d832E9404129cb6cdAA960862FdF98b9";
const NFT_MARKETPLACE_CONTRACT_ADDRESS = "0x1162745302206dFf473d2d20b2eA131aD65242c8";

// eslint-disable-next-line no-unused-vars
const YOUR_SEPOLIA_ACCOUNT = "0xEfedb31f097d7f7060F34D1096fDf607501fAc56"; // Your actual Sepolia MetaMask address


const NFTMarketplace = () => {
  const [account, setAccount] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [myNftContract, setMyNftContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);

  const [currentPage, setCurrentPage] = useState('marketplace');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [hoveredNFT, setHoveredNFT] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [messages, setMessages] = useState([
    { id: 1, user: 'CyberTrader', message: 'Amazing collection! ðŸš€', time: '2m ago', avatar: 'ðŸš€' },
    { id: 2, user: 'NeonQueen', message: 'Price predictions looking bullish', time: '5m ago', avatar: 'ðŸ‘‘' },
    { id: 3, user: 'BlockchainBob', message: 'New drop incoming!', time: '8m ago', avatar: 'ðŸ¤–' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const canvasRef = useRef(null);

  const [liveNftData, setLiveNftData] = useState([]);
  const [userOwnedNFTs, setUserOwnedNFTs] = useState([]);


  const categories = [
    { id: 'all', name: 'All', icon: Grid },
    { id: 'art', name: 'Art', icon: Star },
    { id: 'gaming', name: 'Gaming', icon: Zap },
    { id: 'music', name: 'Music', icon: Heart },
    { id: 'sports', name: 'Sports', icon: TrendingUp },
    { id: 'virtual', name: 'Virtual', icon: Globe }
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new BrowserProvider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setWalletConnected(true);

        const myNftContractInstance = new Contract(MY_NFT_CONTRACT_ADDRESS, MyNFTAbi, _signer);
        const marketplaceContractInstance = new Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFTMarketplaceAbi, _signer);
        setMyNftContract(myNftContractInstance);
        setMarketplaceContract(marketplaceContractInstance);

        console.log("Wallet connected:", _account);
        console.log("MyNFT Contract:", myNftContractInstance);
        console.log("Marketplace Contract:", marketplaceContractInstance);

      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please ensure MetaMask is installed and unlocked.");
      }
    } else {
      alert("Install MetaMask!");
    }
  };

  useEffect(() => {
    const fetchNftsFromFirestore = () => {
      const q = query(collection(db, "nfts"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedNfts = snapshot.docs.map(doc => ({
          ...doc.data(),
          firebaseDocId: doc.id
        }));
        setLiveNftData(fetchedNfts);
        console.log("Fetched NFTs from Firestore:", fetchedNfts);

        if (account) {
            const owned = fetchedNfts.filter(nft => nft.owner?.toLowerCase() === account.toLowerCase());
            setUserOwnedNFTs(owned);
        }
      });
      return unsubscribe;
    };

    const unsubscribe = fetchNftsFromFirestore();
    return () => unsubscribe();
  }, [account]);

  const listNFT = async (nftFirebaseDocId, tokenId, priceWeiString) => {
    if (!marketplaceContract || !myNftContract || !signer) {
      alert("Connect wallet and contracts must be initialized!");
      return;
    }

    try {
      const priceWei = BigInt(priceWeiString);

      console.log(`Approving marketplace ${NFT_MARKETPLACE_CONTRACT_ADDRESS} for tokenId ${tokenId}...`);
      const approveTx = await myNftContract.approve(NFT_MARKETPLACE_CONTRACT_ADDRESS, tokenId);
      await approveTx.wait();
      console.log("Approval successful:", approveTx.hash);

      console.log(`Listing tokenId ${tokenId} at price ${formatEther(priceWei)} ETH...`);
      const listTx = await marketplaceContract.listItem(tokenId, priceWei);
      await listTx.wait();
      console.log("Listing successful:", listTx.hash);

      const nftDocRef = doc(db, "nfts", nftFirebaseDocId);
      await updateDoc(nftDocRef, {
        isListed: true,
      });

      alert(`NFT (Token ID: ${tokenId}) listed successfully for ${formatEther(priceWei)} ETH!`);
    } catch (err) {
      console.error("Failed to list NFT:", err);
      alert("Failed to list NFT: " + err.message);
    }
  };

  const buyNFT = async (nftFirebaseDocId, tokenId, priceWeiString) => {
    if (!marketplaceContract || !signer) {
      alert("Connect wallet and contracts must be initialized!");
      return;
    }

    try {
      const priceWei = BigInt(priceWeiString);

      // --- NEW: Fetch the original seller's address from the marketplace contract ---
      const marketItem = await marketplaceContract.marketItems(tokenId);
      const originalSeller = marketItem.seller; // Access the 'seller' property from the returned struct

      console.log(`Attempting to buy tokenId ${tokenId} from seller ${originalSeller} for ${formatEther(priceWei)} ETH...`);

      const tx = await marketplaceContract.buyItem(tokenId, { value: priceWei });
      await tx.wait();
      console.log("Purchase transaction successful:", tx.hash);

      const nftDocRef = doc(db, "nfts", nftFirebaseDocId);
      await updateDoc(nftDocRef, {
        owner: account,
        isListed: false,
      });

      // --- MODIFIED: Add 'seller' field to the sales record ---
      await addDoc(collection(db, "sales"), {
        tokenId,
        buyer: account,
        seller: originalSeller, // THIS IS THE CRUCIAL ADDITION for sales history
        price: formatEther(priceWei),
        txHash: tx.hash,
        timestamp: new Date()
      });

      alert("Purchase successful!");
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Purchase failed: " + err.message);
    }
  };

  const filteredNFTs = liveNftData.filter(nft =>
    (selectedCategory === 'all' || nft.category === selectedCategory) &&
    (searchQuery === '' || nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     nft.creator.toLowerCase().includes(searchQuery.toLowerCase())) &&
    nft.isListed === true
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        message: newMessage,
        time: 'now',
        avatar: 'ðŸ˜Ž'
      }]);
      setNewMessage('');
    }
  };

  const NavButton = ({ icon: Icon, label, page, active }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

// The NFTCard component
const NFTCard = ({ nft }) => {
  const displayPrice = nft.currentPrice ? formatEther(BigInt(nft.currentPrice)) : "0";

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-500 transform hover:-translate-y-2 ${
        hoveredNFT === nft.tokenId ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setHoveredNFT(nft.tokenId)}
      onMouseLeave={() => setHoveredNFT(null)}
      onClick={() => setSelectedNFT(nft)}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
        <div className="relative overflow-hidden">
          <img
            src={nft.image}
            alt={nft.title}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 right-4 flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              nft.rarity === 'Legendary' ? 'bg-yellow-500 text-black' :
              nft.rarity === 'Mythic' ? 'bg-purple-500 text-white' :
              nft.rarity === 'Epic' ? 'bg-blue-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {nft.rarity}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-white">
                <Eye size={16} />
                <span className="text-sm">{nft.views}</span>
              </div>
              <div className="flex items-center space-x-2 text-red-400">
                <Heart size={16} />
                <span className="text-sm">{nft.likes}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{nft.title}</h3>
          <p className="text-gray-400 text-sm mb-3">by {nft.creator}</p>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {displayPrice} ETH
            </div>
            {account && nft.owner?.toLowerCase() !== account?.toLowerCase() && nft.isListed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  buyNFT(nft.firebaseDocId, nft.tokenId, nft.currentPrice);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Buy Now
              </button>
            )}
            {account && nft.owner?.toLowerCase() === account?.toLowerCase() && !nft.isListed && (
                <span className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-full">Owned</span>
            )}
            {account && nft.owner?.toLowerCase() === account?.toLowerCase() && nft.isListed && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        listNFT(nft.firebaseDocId, nft.tokenId, nft.currentPrice);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-all duration-300"
                >
                    Your Listing
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
  const CategoryFilter = ({ category, active, onClick }) => {
    const Icon = category.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          active
            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <Icon size={18} />
        <span>{category.name}</span>
      </button>
    );
  };

  const PropertyBar = ({ label, value, color }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            NFT Marketplace
          </h1>
          <p className="text-gray-400">Discover, collect, and sell extraordinary NFTs</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
            />
          </div>
          <button className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {categories.map(category => (
          <CategoryFilter
            key={category.id}
            category={category}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map(nft => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
        {filteredNFTs.length === 0 && (
            <p className="col-span-full text-center text-gray-400 text-lg">No NFTs listed in this category or matching your search.</p>
        )}
      </div>
    </div>
  );

  const [profileTab, setProfileTab] = useState('dashboard');
  // eslint-disable-next-line no-unused-vars
  const [portfolioData, setPortfolioData] = useState([
    { month: 'Jan', value: 12.5, volume: 8.2 },
    { month: 'Feb', value: 18.3, volume: 12.1 },
    { month: 'Mar', value: 25.7, volume: 15.8 },
    { month: 'Apr', value: 32.1, volume: 22.3 },
    { month: 'May', value: 28.9, volume: 18.7 },
    { month: 'Jun', value: 42.7, volume: 28.4 }
  ]);

  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    if (!account) return;

    const qPurchases = query(collection(db, "sales"), where("buyer", "==", account));
    const unsubscribePurchases = onSnapshot(qPurchases, async (snapshot) => {
      const fetchedPurchases = snapshot.docs.map(doc => doc.data());

      const enrichedPurchases = fetchedPurchases.map(purchase => {
        const nftDetail = liveNftData.find(nft => nft.tokenId === purchase.tokenId);
        return {
          ...purchase,
          name: nftDetail?.title || `NFT #${purchase.tokenId}`,
          image: nftDetail?.image || 'https://via.placeholder.com/100x100/333/ffffff?text=NFT',
          status: 'Owned',
          change: '+X%',
        };
      });
      setPurchaseHistory(enrichedPurchases);
    });

    const qSales = query(collection(db, "sales"), where("seller", "==", account));
    const unsubscribeSales = onSnapshot(qSales, async (snapshot) => {
        const fetchedSales = snapshot.docs.map(doc => doc.data());
        const enrichedSales = fetchedSales.map(sale => {
            const nftDetail = liveNftData.find(nft => nft.tokenId === sale.tokenId);
            return {
                ...sale,
                name: nftDetail?.title || `NFT #${sale.tokenId}`,
                image: nftDetail?.image || 'https://via.placeholder.com/100x100/ff6b35/ffffff?text=SOLD',
                profit: `+${(parseFloat(sale.price) * 0.1).toFixed(2)} ETH`,
            };
        });
        setSalesHistory(enrichedSales);
    });

    return () => {
      unsubscribePurchases();
      unsubscribeSales();
    };
  }, [account, liveNftData]);

  const renderProfile = () => {
    const totalNftsOwned = userOwnedNFTs.length;
    const totalSalesCount = salesHistory.length;
    const totalSalesEth = salesHistory.reduce((sum, sale) => sum + parseFloat(sale.price || '0'), 0);
    const totalProfitEth = salesHistory.reduce((sum, sale) => {
      const profitValue = parseFloat(sale.profit?.replace('+', '').replace(' ETH', '') || '0');
      return sum + profitValue;
    }, 0);

    const portfolioValueEth = userOwnedNFTs.reduce((sum, nft) => {
      return sum + (nft.currentPrice ? parseFloat(formatEther(BigInt(nft.currentPrice))) : 0);
    }, 0);

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 rounded-2xl p-8 border border-gray-700 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 flex items-center space-x-8 mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 animate-pulse"></div>
                <User size={60} className="text-white relative z-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">CyberCollector</h2>
              <p className="text-gray-400 mb-4">{account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect wallet to see profile"}</p>
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-400">{totalNftsOwned} NFTs owned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-400">0 NFTs created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">{totalSalesEth.toFixed(2)} ETH volume</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Portfolio Value</h3>
                <TrendingUp className="text-green-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-cyan-400 mb-1">{portfolioValueEth.toFixed(2)} ETH</p>
              <p className="text-green-400 text-sm">+0% ($0)</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Sales</h3>
                <Star className="text-purple-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-purple-400 mb-1">{totalSalesCount}</p>
              <p className="text-green-400 text-sm">+0% this month</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Profit/Loss</h3>
                <TrendingUp className="text-yellow-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{totalProfitEth >= 0 ? '+' : ''}{totalProfitEth.toFixed(2)} ETH</p>
              <p className="text-green-400 text-sm">+0% ROI</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Rank</h3>
                <Shield className="text-yellow-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-yellow-400 mb-1">#--</p>
              <p className="text-green-400 text-sm">---</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Grid },
            { id: 'purchases', label: 'Purchases', icon: Download },
            { id: 'sales', label: 'Sales', icon: TrendingUp },
            { id: 'collection', label: 'Collection', icon: Star },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  profileTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {profileTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Portfolio Performance</h3>
              <div className="h-64 relative">
                <p className="text-gray-500 text-center pt-24">Graph data will be integrated here.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {purchaseHistory.length === 0 && salesHistory.length === 0 ? (
                    <p className="text-gray-400">No recent activity.</p>
                ) : (
                    <>
                      {purchaseHistory.slice(0, 3).map((item, index) => (
                        <div key={`purchase-${index}`} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-gray-400 text-sm">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-cyan-400 font-bold">{item.price} ETH</p>
                            <p className={`text-sm text-green-400`}>Purchased</p>
                          </div>
                        </div>
                      ))}
                      {salesHistory.slice(0, 3).map((item, index) => (
                          <div key={`sale-${index}`} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1">
                                  <h4 className="text-white font-medium">{item.name}</h4>
                                  <p className="text-gray-400 text-sm">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-purple-400 font-bold">{item.price} ETH</p>
                                  <p className={`text-sm text-yellow-400`}>Sold</p>
                              </div>
                          </div>
                      ))}
                    </>
                )}
              </div>
            </div>
          </div>
        )}

        {profileTab === 'purchases' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Purchase History</h3>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Filter size={16} />
                </button>
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3">NFT</th>
                    <th className="text-left text-gray-400 font-medium py-3">Price</th>
                    <th className="text-left text-gray-400 font-medium py-3">Date</th>
                    <th className="text-left text-gray-400 font-medium py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-gray-400 py-4">No purchase history.</td></tr>
                  ) : (
                      purchaseHistory.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="text-white font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-cyan-400 font-bold">{item.price} ETH</td>
                          <td className="py-4 text-gray-400">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400`}>
                              Owned
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {profileTab === 'sales' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Sales History</h3>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Filter size={16} />
                </button>
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3">NFT</th>
                    <th className="text-left text-gray-400 font-medium py-3">Sale Price</th>
                    <th className="text-left text-gray-400 font-medium py-3">Date</th>
                    <th className="text-left text-gray-400 font-medium py-3">Buyer</th>
                    <th className="text-left text-gray-400 font-medium py-3">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-gray-400 py-4">No sales history.</td></tr>
                  ) : (
                      salesHistory.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="text-white font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-cyan-400 font-bold">{item.price} ETH</td>
                          <td className="py-4 text-gray-400">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</td>
                          <td className="py-4 text-purple-400">{item.buyer.slice(0,6)}...{item.buyer.slice(-4)}</td>
                          <td className="py-4 text-green-400 font-bold">{item.profit}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {profileTab === 'collection' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">My Collection</h3>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Grid size={16} />
                </button>
                <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userOwnedNFTs.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 text-lg">You don't own any NFTs yet.</p>
              ) : (
                  userOwnedNFTs.map(nft => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const [newNftDetails, setNewNftDetails] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
    category: 'art',
    rarity: 'Common',
    creator: 'Your Marketplace',
  });

  const handleCreateNFT = async () => {
    if (!myNftContract || !signer || !account) {
      alert("Connect wallet to create NFT!");
      return;
    }
    if (!newNftDetails.title || !newNftDetails.description || !newNftDetails.image || !newNftDetails.price) {
      alert("Please fill all NFT details.");
      return;
    }

    try {
      const priceWei = parseEther(newNftDetails.price);
      console.log("Preparing to mint NFT with details:", newNftDetails);

      const tx = await myNftContract.mintNFT(account, newNftDetails.image, priceWei);
      console.log("Minting transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Minting transaction confirmed:", receipt);

      let mintedTokenId;
      for (const log of receipt.logs) {
          try {
              const parsedLog = myNftContract.interface.parseLog(log);
              if (parsedLog && parsedLog.name === "NFTMinted") {
                  mintedTokenId = Number(parsedLog.args.tokenId);
                  console.log("NFTMinted event found! Token ID:", mintedTokenId);
                  break;
              }
          } catch (e) {
          }
      }

      if (mintedTokenId === undefined) {
          throw new Error("Could not find NFTMinted event in transaction receipt. Minting might have failed or event parsing issue.");
      }

      await addDoc(collection(db, "nfts"), {
        tokenId: mintedTokenId,
        title: newNftDetails.title,
        description: newNftDetails.description,
        image: newNftDetails.image,
        currentPrice: priceWei.toString(),
        creator: newNftDetails.creator,
        category: newNftDetails.category,
        rarity: newNftDetails.rarity,
        owner: account,
        isListed: false,
        likes: 0,
        views: 0,
        timestamp: new Date()
      });

      alert("NFT created and minted successfully!");
      setNewNftDetails({
        title: '',
        description: '',
        image: '',
        price: '',
        category: 'art',
        rarity: 'Common',
        creator: 'Your Marketplace',
      });
      setCurrentPage('profile');
    } catch (err) {
      console.error("Failed to create NFT:", err);
      if (err.code === 'UNPREDICTABLE_GAS_LIMIT' || err.code === 'CALL_EXCEPTION') {
          alert(`Failed to create NFT: Transaction reverted. Check console for details. Error: ${err.reason || err.message}`);
      } else if (err.code === 'ACTION_REJECTED') {
          alert("Failed to create NFT: Transaction rejected by user in MetaMask.");
      } else {
          alert("Failed to create NFT: " + err.message);
      }
    }
  };

  const renderCreate = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Create NFT
        </h1>
        <p className="text-gray-400">Mint your digital masterpiece</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">NFT Image URL</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              placeholder="e.g., https://ipfs.io/ipfs/Qm..."
              value={newNftDetails.image}
              onChange={(e) => setNewNftDetails({ ...newNftDetails, image: e.target.value })}
            />
             <p className="text-sm text-gray-500 mt-2">Use an image URL (e.g., from IPFS, or any public image URL for demo).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              placeholder="Enter NFT name"
              value={newNftDetails.title}
              onChange={(e) => setNewNftDetails({ ...newNftDetails, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              placeholder="Describe your NFT"
              value={newNftDetails.description}
              onChange={(e) => setNewNftDetails({ ...newNftDetails, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Initial Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="0.00 ETH"
                value={newNftDetails.price}
                onChange={(e) => setNewNftDetails({ ...newNftDetails, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                value={newNftDetails.category}
                onChange={(e) => setNewNftDetails({ ...newNftDetails, category: e.target.value })}
              >
                {categories.slice(1).map(cat => ( // Exclude 'All' category
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Rarity</label>
              <select
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                value={newNftDetails.rarity}
                onChange={(e) => setNewNftDetails({ ...newNftDetails, rarity: e.target.value })}
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
                <option value="Mythic">Mythic</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Creator</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="Creator Name"
                value={newNftDetails.creator}
                onChange={(e) => setNewNftDetails({ ...newNftDetails, creator: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={handleCreateNFT}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Mint NFT
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 z-10" />

      {/* Main Content */}
      <div className="relative z-20">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Zap size={20} className="text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    CyberMarket
                  </span>
                </div>

                <nav className="hidden md:flex space-x-4">
                  <NavButton
                    icon={Grid}
                    label="Marketplace"
                    page="marketplace"
                    active={currentPage === 'marketplace'}
                  />
                  <NavButton
                    icon={TrendingUp}
                    label="Trending"
                    page="trending"
                    active={currentPage === 'trending'}
                  />
                  <NavButton
                    icon={Plus}
                    label="Create"
                    page="create"
                    active={currentPage === 'create'}
                  />
                  <NavButton
                    icon={User}
                    label="Profile"
                    page="profile"
                    active={currentPage === 'profile'}
                  />
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={walletConnected ? null : connectWallet}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    walletConnected
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Wallet size={16} />
                    <span>{walletConnected ? account?.slice(0, 6) + "..." + account?.slice(-4) : "Connect Wallet"}</span>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentPage === 'marketplace' && renderMarketplace()}
          {currentPage === 'profile' && renderProfile()}
          {currentPage === 'create' && renderCreate()}
          {currentPage === 'trending' && renderMarketplace()}
        </main>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="fixed bottom-4 right-4 w-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Community Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map(message => (
                <div key={message.id} className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                    {message.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white">{message.user}</span>
                      <span className="text-xs text-gray-400">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-300">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">{selectedNFT.title}</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                <div>
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.title}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-400">{selectedNFT.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
                    <div className="space-y-3">
                      {selectedNFT.properties && Object.entries(selectedNFT.properties).map(([key, value]) => (
                        <PropertyBar
                          key={key}
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={value}
                          color="from-cyan-500 to-purple-600"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Creator</span>
                        <span className="text-white">{selectedNFT.creator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rarity</span>
                        <span className="text-white">{selectedNFT.rarity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Views</span>
                        <span className="text-white">{selectedNFT.views || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Likes</span>
                        <span className="text-white">{selectedNFT.likes || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Current Price</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {selectedNFT.currentPrice ? formatEther(BigInt(selectedNFT.currentPrice)) : "0"} ETH
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                          <Heart size={20} />
                        </button>
                        <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                          <Share2 size={20} />
                        </button>
                        <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {selectedNFT.owner?.toLowerCase() !== account?.toLowerCase() && selectedNFT.isListed ? (
                        <button
                          onClick={() => buyNFT(selectedNFT.firebaseDocId, selectedNFT.tokenId, selectedNFT.currentPrice)}
                          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
                        >
                          Buy Now
                        </button>
                      ) : selectedNFT.owner?.toLowerCase() === account?.toLowerCase() && !selectedNFT.isListed ? (
                          <button
                            onClick={() => listNFT(selectedNFT.firebaseDocId, selectedNFT.tokenId, selectedNFT.currentPrice)}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 font-semibold"
                          >
                            List for Sale
                          </button>
                      ) : (
                          <span className="flex-1 py-3 text-center text-gray-400">NFT is owned or not available.</span>
                      )}

                      {selectedNFT.owner?.toLowerCase() !== account?.toLowerCase() && selectedNFT.isListed && (
                        <button className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 border border-gray-600">
                          Make Offer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setCurrentPage('create')}
            className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-800 p-4 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Network: </span>
              <span className="text-white">Sepolia (ETH)</span>
            </div>
            {/* These would require fetching from a blockchain RPC or API */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Gas: </span>
              <span className="text-cyan-400">-- gwei</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">ETH: </span>
              <span className="text-green-400">$--.--</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">24h Volume: </span>
              <span className="text-purple-400">-- ETH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;