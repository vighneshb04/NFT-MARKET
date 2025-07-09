import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, User, Wallet, Grid, TrendingUp, Star, Heart, Eye, Zap, Shield, Globe, Settings, Bell, Menu, X, Plus, Filter, Share2, Download, ExternalLink } from 'lucide-react';

const NFTMarketplace = () => {
  const [currentPage, setCurrentPage] = useState('marketplace');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [hoveredNFT, setHoveredNFT] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [messages, setMessages] = useState([
    { id: 1, user: 'CyberTrader', message: 'Amazing collection! ðŸš€', time: '2m ago',  },
    { id: 2, user: 'NeonQueen', message: 'Price predictions looking bullish', time: '5m ago', avatar: 'ðŸ‘‘' },
    { id: 3, user: 'BlockchainBob', message: 'New drop incoming!', time: '8m ago', avatar: 'ðŸ¤–' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const canvasRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All', icon: Grid },
    { id: 'art', name: 'Art', icon: Star },
    { id: 'gaming', name: 'Gaming', icon: Zap },
    { id: 'music', name: 'Music', icon: Heart },
    { id: 'sports', name: 'Sports', icon: TrendingUp },
    { id: 'virtual', name: 'Virtual', icon: Globe }
  ];

  const nftData = [
    {
      id: 1,
      title: "Cyber Samurai #001",
      price: "2.5 ETH",
      image: "https://assets.raribleuserdata.com/prod/v1/image/t_image_big/aHR0cHM6Ly9pcGZzLnJhcmlibGV1c2VyZGF0YS5jb20vaXBmcy9RbVBNOWRzcllmMXNZVmVxdlJoOWM1aWlmZldBZEoxa1lYZXgyTkMxZ0FlUUc4",
      creator: "NeonArtist",
      likes: 1247,
      views: 5832,
      category: 'art',
      rarity: 'Legendary',
      description: "A legendary cyber samurai from the digital realm",
      properties: { strength: 95, speed: 88, rarity: 99 }
    },
    {
      id: 2,
      title: "Neon Dreams #789",
      price: "1.8 ETH",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMWsdyhvZPp2GOvp8y4wfi6yChGE-DcaGArw&s",
      creator: "VaporWave",
      likes: 892,
      views: 3421,
      category: 'art',
      rarity: 'Epic',
      description: "Synthwave aesthetics meet digital artistry",
      properties: { vibe: 92, aesthetic: 97, nostalgia: 85 }
    },
    {
      id: 3,
      title: "Quantum Warrior",
      price: "3.2 ETH",
      image: "https://pbs.twimg.com/profile_images/1508489360865439753/dD-U_mBW_400x400.jpg",
      creator: "QuantumLab",
      likes: 1856,
      views: 7234,
      category: 'gaming',
      rarity: 'Mythic',
      description: "Battle-ready warrior from quantum dimensions",
      properties: { power: 98, defense: 94, quantum: 100 }
    },
    {
      id: 4,
      title: "Digital Phoenix",
      price: "4.1 ETH",
      image: "https://imgcdn.stablediffusionweb.com/2024/11/4/1ce74b08-3643-4636-b1f5-e0be4e35b81c.jpg",
      creator: "FireCode",
      likes: 2341,
      views: 9876,
      category: 'art',
      rarity: 'Legendary',
      description: "Reborn from digital ashes with blazing code",
      properties: { fire: 100, rebirth: 96, code: 93 }
    },
    {
      id: 5,
      title: "Hologram Beat",
      price: "1.9 ETH",
      image: "https://cdn.uppbeat.io/motiongraphics/NFTIntro/4141/Preview.jpg",
      creator: "SoundWave",
      likes: 1456,
      views: 4532,
      category: 'music',
      rarity: 'Rare',
      description: "Musical NFT with interactive sound waves",
      properties: { rhythm: 89, harmony: 94, digital: 91 }
    },
    {
      id: 6,
      title: "Cyber Stadium",
      price: "2.7 ETH",
      image: "https://www.nftculture.com/wp-content/uploads/2023/02/01799-1371608713.jpg",
      creator: "SportsTech",
      likes: 987,
      views: 3210,
      category: 'sports',
      rarity: 'Epic',
      description: "Futuristic sports arena in the metaverse",
      properties: { technology: 96, atmosphere: 88, future: 94 }
    },
    {
  id: 7,
  title: "Neon Drift",
  price: "3.1 ETH",
  image: "https://i.pinimg.com/736x/ae/3f/97/ae3f9713023e1ecfe8b3f72eced3d596.jpg",
  creator: "TurboRacers",
  likes: 1245,
  views: 4567,
  category: 'racing',
  rarity: 'Legendary',
  description: "High-speed racing experience in a neon-drenched cityscape",
  properties: { speed: 99, handling: 93, thrill: 95 }
},
{
  id: 8,
  title: "Zen Garden VR",
  price: "1.9 ETH",
  image: "https://cdn.dribbble.com/userupload/33043126/file/original-09d16d45f4ae009e0364c4696147523f.jpg?resize=400x0",
  creator: "MindScape",
  likes: 872,
  views: 2890,
  category: 'relaxation',
  rarity: 'Rare',
  description: "Tranquil virtual garden designed for meditation and calm",
  properties: { serenity: 98, design: 90, immersion: 92 }
}

  ];

  const filteredNFTs = nftData.filter(nft => 
    (selectedCategory === 'all' || nft.category === selectedCategory) &&
    (searchQuery === '' || nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     nft.creator.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Animated background canvas
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

  const NFTCard = ({ nft }) => (
    <div
      className={`relative group cursor-pointer transition-all duration-500 transform hover:-translate-y-2 ${
        hoveredNFT === nft.id ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setHoveredNFT(nft.id)}
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
              {nft.price}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>
    </div>
  );

  const [profileTab, setProfileTab] = useState('dashboard');
  const [portfolioData, setPortfolioData] = useState([
    { month: 'Jan', value: 12.5, volume: 8.2 },
    { month: 'Feb', value: 18.3, volume: 12.1 },
    { month: 'Mar', value: 25.7, volume: 15.8 },
    { month: 'Apr', value: 32.1, volume: 22.3 },
    { month: 'May', value: 28.9, volume: 18.7 },
    { month: 'Jun', value: 42.7, volume: 28.4 }
  ]);

  const purchaseHistory = [
    { id: 1, name: 'Cyber Samurai #001', price: '2.5 ETH', date: '2 days ago', status: 'Owned', change: '+15.2%', image: nftData[0].image },
    { id: 2, name: 'Neon Dreams #789', price: '1.8 ETH', date: '1 week ago', status: 'Owned', change: '+8.7%', image: nftData[1].image },
    { id: 3, name: 'Digital Phoenix', price: '4.1 ETH', date: '2 weeks ago', status: 'Owned', change: '+22.1%', image: nftData[3].image },
    { id: 4, name: 'Quantum Warrior', price: '3.2 ETH', date: '1 month ago', status: 'Sold', change: '+45.3%', image: nftData[2].image },
  ];

  const salesHistory = [
    { id: 1, name: 'Cyber Dragon #445', price: '5.2 ETH', date: '3 days ago', buyer: 'CryptoKnight', profit: '+2.1 ETH', image: 'https://via.placeholder.com/100x100/ff6b35/ffffff?text=SOLD' },
    { id: 2, name: 'Neon City #123', price: '3.8 ETH', date: '1 week ago', buyer: 'DigitalArt', profit: '+1.3 ETH', image: 'https://via.placeholder.com/100x100/7209b7/ffffff?text=SOLD' },
    { id: 3, name: 'Quantum Beast', price: '6.7 ETH', date: '2 weeks ago', buyer: 'MetaTrader', profit: '+3.2 ETH', image: 'https://via.placeholder.com/100x100/2196f3/ffffff?text=SOLD' },
  ];

  const renderProfile = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header with 3D Elements */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 rounded-2xl p-8 border border-gray-700 overflow-hidden">
        {/* 3D Floating Elements */}
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
            <p className="text-gray-400 mb-4">Digital art enthusiast & NFT trader</p>
            <div className="flex space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400">42 NFTs owned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400">18 NFTs created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">156 ETH volume</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stock Market Style Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Portfolio Value</h3>
              <TrendingUp className="text-green-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-cyan-400 mb-1">42.7 ETH</p>
            <p className="text-green-400 text-sm">+12.5% ($18,234)</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Sales</h3>
              <Star className="text-purple-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-1">28.3 ETH</p>
            <p className="text-green-400 text-sm">+8.2% this month</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Profit/Loss</h3>
              <TrendingUp className="text-yellow-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-1">+14.4 ETH</p>
            <p className="text-green-400 text-sm">+51.2% ROI</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Rank</h3>
              <Shield className="text-yellow-400" size={16} />
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-1">#247</p>
            <p className="text-green-400 text-sm">Top 1% traders</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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

      {/* Tab Content */}
      {profileTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Portfolio Chart */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Portfolio Performance</h3>
            <div className="h-64 relative">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 200 Q 150 150 250 120 T 450 100 T 650 80"
                  stroke="url(#portfolioGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M 50 200 Q 150 150 250 120 T 450 100 T 650 80 L 650 250 L 50 250 Z"
                  fill="url(#portfolioGradient)"
                />
              </svg>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {purchaseHistory.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-gray-400 text-sm">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">{item.price}</p>
                    <p className={`text-sm ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change}
                    </p>
                  </div>
                </div>
              ))}
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
                  <th className="text-left text-gray-400 font-medium py-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map(item => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-white font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-cyan-400 font-bold">{item.price}</td>
                    <td className="py-4 text-gray-400">{item.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Owned' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={`py-4 font-medium ${
                      item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.change}
                    </td>
                  </tr>
                ))}
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
                {salesHistory.map(item => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-white font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-cyan-400 font-bold">{item.price}</td>
                    <td className="py-4 text-gray-400">{item.date}</td>
                    <td className="py-4 text-purple-400">{item.buyer}</td>
                    <td className="py-4 text-green-400 font-bold">{item.profit}</td>
                  </tr>
                ))}
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
            {nftData.map(nft => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
            <label className="block text-sm font-medium text-gray-400 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-cyan-500 transition-colors duration-300">
              <Plus size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF, MP4 up to 100MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              placeholder="Enter NFT name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              placeholder="Describe your NFT"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="0.00 ETH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Royalties</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="10%"
              />
            </div>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold">
            Create NFT
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
                  onClick={() => setWalletConnected(!walletConnected)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    walletConnected
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Wallet size={16} />
                    <span>{walletConnected ? 'Connected' : 'Connect Wallet'}</span>
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
                      {Object.entries(selectedNFT.properties).map(([key, value]) => (
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
                        <span className="text-white">{selectedNFT.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Likes</span>
                        <span className="text-white">{selectedNFT.likes}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Current Price</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {selectedNFT.price}
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
                      <button className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold">
                        Buy Now
                      </button>
                      <button className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 border border-gray-600">
                        Make Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 left-6 z-40">
          <button className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
            <Plus size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-800 p-4 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Network: </span>
              <span className="text-white">Ethereum</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Gas: </span>
              <span className="text-cyan-400">42 gwei</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">ETH: </span>
              <span className="text-green-400">$3,247.82</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">24h Volume: </span>
              <span className="text-purple-400">1,247 ETH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;
