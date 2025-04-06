"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Search, Filter, Calendar, Clock, ExternalLink, Bookmark, Share2, RefreshCw } from "lucide-react"

const NewsSection = () => {
    const [newsItems, setNewsItems] = useState([])
    const [activeNewsItem, setActiveNewsItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [bookmarkedNews, setBookmarkedNews] = useState([])
    const [sortBy, setSortBy] = useState("newest") // "newest" or "relevance"

    // Categories for agriculture news
    const categories = ["All", "Crops", "Livestock", "Technology", "Policy", "Market", "Climate", "Research"]

    useEffect(() => {
        fetchNews()
    }, [selectedCategory, sortBy])

    const fetchNews = async () => {
        setLoading(true)
        setError(null)

        try {
            // Using GNews API with agriculture keywords
            // You'll need to sign up for a free API key at https://gnews.io/
            const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
            const query = selectedCategory !== "All" ? `agriculture ${selectedCategory}` : "agriculture";
            const encodedQuery = encodeURIComponent(query);

            const apiUrl = `https://gnews.io/api/v4/search?q=${encodedQuery}&lang=en&country=us&max=10&apikey=${apiKey}&sortby=${sortBy === "newest" ? "publishedAt" : "relevance"}`;

            const response = await fetch(apiUrl)
            const data = await response.json()

            if (data.articles) {
                // Transform the API response to match our data structure
                const formattedNews = data.articles.map((article, index) => ({
                    id: index + 1,
                    title: article.title,
                    summary: article.description,
                    date: formatDate(article.publishedAt),
                    image: article.image || "/placeholder.svg",
                    category: getCategoryFromTitle(article.title, selectedCategory),
                    url: article.url,
                    source: article.source.name,
                    content: article.content
                }))

                setNewsItems(formattedNews)
            } else {
                throw new Error("No articles found")
            }
        } catch (err) {
            console.error("Error fetching news:", err)
            setError("Failed to fetch agriculture news. Using demo data instead.")

            // Fallback to demo data
            setNewsItems([
                {
                    id: 1,
                    title: "New Drought-Resistant Wheat Variety Released",
                    summary: "Scientists have developed a new wheat variety that can withstand severe drought conditions.",
                    date: "2 hours ago",
                    image: "/placeholder.svg",
                    category: "Research",
                    source: "AgriTech Today",
                    url: "#"
                },
                {
                    id: 2,
                    title: "Government Announces Subsidy for Organic Farming",
                    summary: "The agriculture ministry has announced a new subsidy program to promote organic farming practices.",
                    date: "Yesterday",
                    image: "/placeholder.svg",
                    category: "Policy",
                    source: "Farm Policy Journal",
                    url: "#"
                },
                {
                    id: 3,
                    title: "Smart Irrigation Systems Reduce Water Usage by 30%",
                    summary: "A new study shows that smart irrigation systems can significantly reduce water consumption.",
                    date: "2 days ago",
                    image: "/placeholder.svg",
                    category: "Technology",
                    source: "AgTech Weekly",
                    url: "#"
                },
                {
                    id: 4,
                    title: "Market Outlook: Crop Prices Expected to Rise",
                    summary: "Analysts predict an increase in crop prices due to global supply chain disruptions.",
                    date: "3 days ago",
                    image: "/placeholder.svg",
                    category: "Market",
                    source: "Agri Market Review",
                    url: "#"
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    // Helper function to format the API date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60))
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
            }
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
        } else if (diffDays === 1) {
            return "Yesterday"
        } else if (diffDays < 7) {
            return `${diffDays} days ago`
        } else {
            return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
        }
    }

    // Extract a category from the news title if none is provided by the API
    const getCategoryFromTitle = (title, defaultCategory) => {
        if (defaultCategory !== "All") return defaultCategory

        const categoryKeywords = {
            "Crops": ["crop", "wheat", "corn", "soybean", "rice", "harvest"],
            "Livestock": ["cattle", "cow", "pig", "chicken", "sheep", "livestock", "dairy"],
            "Technology": ["tech", "smart", "digital", "AI", "robot", "drone", "automation"],
            "Policy": ["policy", "regulation", "government", "subsidy", "law"],
            "Market": ["market", "price", "export", "import", "trade", "supply", "demand"],
            "Climate": ["climate", "weather", "drought", "flood", "rain", "temperature"],
            "Research": ["research", "study", "scientist", "develop", "innovation", "university"]
        }

        const lowercaseTitle = title.toLowerCase()

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lowercaseTitle.includes(keyword))) {
                return category
            }
        }

        return "General"
    }

    const handleNewsClick = (newsItem) => {
        setActiveNewsItem(newsItem)
        // Save to recently viewed in localStorage
        try {
            const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewedNews") || "[]")
            const updatedRecentlyViewed = [newsItem.id, ...recentlyViewed.filter(id => id !== newsItem.id)].slice(0, 10)
            localStorage.setItem("recentlyViewedNews", JSON.stringify(updatedRecentlyViewed))
        } catch (err) {
            console.error("Error saving to localStorage:", err)
        }
    }

    const handleBackToNews = () => {
        setActiveNewsItem(null)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        const filtered = newsItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )

        if (filtered.length > 0) {
            setNewsItems(filtered)
        } else {
            alert("No results found. Try a different search term.")
        }
    }

    const handleCategoryClick = (category) => {
        setSelectedCategory(category)
    }

    const handleBookmark = (newsItem) => {
        const isBookmarked = bookmarkedNews.some(item => item.id === newsItem.id)

        if (isBookmarked) {
            setBookmarkedNews(bookmarkedNews.filter(item => item.id !== newsItem.id))
        } else {
            setBookmarkedNews([...bookmarkedNews, newsItem])
        }

        // Save to localStorage
        try {
            localStorage.setItem("bookmarkedAgriNews", JSON.stringify(
                isBookmarked
                    ? bookmarkedNews.filter(item => item.id !== newsItem.id)
                    : [...bookmarkedNews, newsItem]
            ))
        } catch (err) {
            console.error("Error saving bookmarks:", err)
        }
    }

    const isBookmarked = (newsItem) => {
        return bookmarkedNews.some(item => item.id === newsItem.id)
    }

    const handleShare = (newsItem) => {
        if (navigator.share) {
            navigator.share({
                title: newsItem.title,
                text: newsItem.summary,
                url: newsItem.url || window.location.href
            })
        } else {
            // Fallback for browsers that don't support the Web Share API
            const shareText = `${newsItem.title}\n\n${newsItem.summary}\n\n${newsItem.url || window.location.href}`
            navigator.clipboard.writeText(shareText)
                .then(() => alert("Link copied to clipboard!"))
                .catch(err => console.error("Error copying to clipboard:", err))
        }
    }

    const resetFilters = () => {
        setSearchQuery("")
        setSelectedCategory("All")
        fetchNews()
    }

    // Load bookmarks from localStorage on component mount
    useEffect(() => {
        try {
            const savedBookmarks = JSON.parse(localStorage.getItem("bookmarkedAgriNews") || "[]")
            setBookmarkedNews(savedBookmarks)
        } catch (err) {
            console.error("Error loading bookmarks:", err)
        }
    }, [])

    const filterByCategory = (category) => {
        if (category === "All") {
            return newsItems
        }
        return newsItems.filter(item => item.category === category)
    }

    // Filter the news items based on the selected category
    const filteredNews = filterByCategory(selectedCategory)

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header section */}
            <div className="bg-green-700 text-white p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Agriculture News & Updates</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchNews}
                        className="p-2 bg-green-600 rounded-full hover:bg-green-800 transition-colors"
                        title="Refresh news"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {!activeNewsItem ? (
                <>
                    {/* Search and filter bar */}
                    {/* <div className="bg-green-50 p-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <form onSubmit={handleSearch} className="relative flex-grow w-full sm:w-auto">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search agriculture news..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-2 text-green-600 font-medium"
                                >
                                    Search
                                </button>
                            </form>

                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="relevance">Most Relevant</option>
                                </select>
                                <button
                                    onClick={resetFilters}
                                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div> */}

                    {/* Category filters */}
                    <div className="p-2 border-b overflow-x-auto">
                        <div className="flex space-x-2 min-w-max">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading / Error / Empty */}
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-600">{error}</div>
                    ) : filteredNews.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">
                                No news articles found. Try a different category or search term.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Show All News
                            </button>
                        </div>
                    ) : (
                        <div className="relative px-4 py-6">
                            {/* Carousel navigation buttons */}
                            <button
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-green-600 hidden md:flex items-center justify-center"
                                onClick={() => {
                                    const container = document.getElementById('news-carousel');
                                    if (container) {
                                        container.scrollBy({ left: -300, behavior: 'smooth' });
                                    }
                                }}
                            >
                                <ChevronRight size={24} className="transform rotate-180" />
                            </button>

                            <button
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-green-600 hidden md:flex items-center justify-center"
                                onClick={() => {
                                    const container = document.getElementById('news-carousel');
                                    if (container) {
                                        container.scrollBy({ left: 300, behavior: 'smooth' });
                                    }
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Carousel scrolling container */}
                            <div
                                id="news-carousel"
                                className="overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                <div className="flex space-x-4 pl-2 pr-8">
                                    {filteredNews.map((item) => (
                                        <div
                                            key={item.id}
                                            className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 snap-start"
                                        >
                                            <div
                                                className="h-48 bg-gray-200 relative cursor-pointer group"
                                                onClick={() => handleNewsClick(item)}
                                            >
                                                <img
                                                    src={item.image || "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                    {item.category}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                    <p className="text-xs text-white flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        {item.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h4
                                                    className="font-medium text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-green-700 text-lg"
                                                    onClick={() => handleNewsClick(item)}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-2">Source: {item.source || "Unknown"}</p>
                                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.summary}</p>

                                                <div className="flex justify-between items-center pt-3 border-t mt-auto">
                                                    <button
                                                        className="text-green-600 text-sm font-medium flex items-center hover:text-green-800 transition-colors"
                                                        onClick={() => handleNewsClick(item)}
                                                    >
                                                        Read More
                                                        <ChevronRight size={16} className="ml-1" />
                                                    </button>

                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBookmark(item);
                                                            }}
                                                            className={`p-1.5 rounded-full transition-colors ${isBookmarked(item)
                                                                    ? "text-yellow-500 bg-yellow-50"
                                                                    : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                                                                }`}
                                                            title={isBookmarked(item) ? "Remove bookmark" : "Add bookmark"}
                                                        >
                                                            <Bookmark size={16} fill={isBookmarked(item) ? "currentColor" : "none"} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShare(item);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Share"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scroll indicator dots */}
                            <div className="flex justify-center space-x-1 mt-4">
                                {Array.from({ length: Math.ceil(filteredNews.length / 3) }).map((_, index) => (
                                    <button
                                        key={index}
                                        className="w-2 h-2 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"
                                        onClick={() => {
                                            const container = document.getElementById('news-carousel');
                                            if (container) {
                                                container.scrollLeft = container.clientWidth * index;
                                            }
                                        }}
                                        aria-label={`Go to slide ${index + 1}`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handleBackToNews} className="flex items-center text-green-600 hover:text-green-700">
                            <ChevronRight size={20} className="transform rotate-180 mr-1" />
                            <span>Back to News</span>
                        </button>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleBookmark(activeNewsItem)}
                                className={`p-2 rounded-full ${isBookmarked(activeNewsItem) ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                title={isBookmarked(activeNewsItem) ? "Remove bookmark" : "Add bookmark"}
                            >
                                <Bookmark size={18} fill={isBookmarked(activeNewsItem) ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={() => handleShare(activeNewsItem)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                                title="Share"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="h-64 bg-gray-200 rounded-lg mb-4 relative">
                        <img
                            src={activeNewsItem.image || "/placeholder.svg"}
                            alt={activeNewsItem.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg"
                            }}
                        />
                        <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full">
                            {activeNewsItem.category}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{activeNewsItem.title}</h3>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar size={14} className="mr-1" />
                            <span className="mr-3">{activeNewsItem.date}</span>
                            <span>Source: {activeNewsItem.source || "Unknown"}</span>
                        </div>

                        <div className="prose max-w-none">
                            <p className="text-gray-700 mb-4">{activeNewsItem.summary}</p>

                            {activeNewsItem.content ? (
                                <p className="text-gray-700 mt-4">{activeNewsItem.content}</p>
                            ) : (
                                <div>
                                    <p className="text-gray-700 mt-4">
                                        The agriculture sector continues to evolve with new technologies and practices aimed at improving
                                        productivity while promoting sustainability. This news highlights important developments that could
                                        impact farmers, agribusinesses, and consumers alike.
                                    </p>
                                    <p className="text-gray-700 mt-4">
                                        Industry experts suggest that staying informed about these developments is crucial for anyone
                                        involved in agriculture. Whether you're a farmer looking to adopt new technologies or a consumer
                                        interested in sustainable food production, understanding these trends can help you make better decisions.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-between items-center pt-4 border-t">
                            {activeNewsItem.url && (
                                <a
                                    href={activeNewsItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700 transition-colors"
                                >
                                    Read Full Article
                                    <ExternalLink size={16} className="ml-1" />
                                </a>
                            )}

                            <button onClick={handleBackToNews} className="text-green-600 hover:text-green-700">
                                View More News
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer section with bookmarked news */}
            {!activeNewsItem && bookmarkedNews.length > 0 && (
                <div className="border-t p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Your Bookmarks</h3>
                    <div className="overflow-x-auto">
                        <div className="flex space-x-4 min-w-max pb-2">
                            {bookmarkedNews.map(item => (
                                <div
                                    key={`bookmark-${item.id}`}
                                    className="w-64 flex items-center p-2 bg-green-50 border border-green-100 rounded-lg cursor-pointer hover:bg-green-100"
                                    onClick={() => handleNewsClick(item)}
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                                        <img
                                            src={item.image || "/placeholder.svg"}
                                            alt=""
                                            className="w-full h-full object-cover rounded"
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = "/placeholder.svg"
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-gray-500">{item.date}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleBookmark(item)
                                        }}
                                        className="text-yellow-500 p-1"
                                    >
                                        <Bookmark size={16} fill="currentColor" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NewsSection