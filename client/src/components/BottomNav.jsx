import { Activity, Cloud, Home, User, Map } from "react-feather"
import { Link, useLocation } from "react-router-dom"

const BottomNav = () => {
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname === path
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40">
            <Link
                to="/home"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/home") ? "text-green-600" : "text-gray-500"
                    }`}
            >
                <Home size={20} />
                <span className="text-xs mt-1">Home</span>
            </Link>

            <Link
                to="/weather"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/weather") ? "text-green-600" : "text-gray-500"
                    }`}
            >
                <Cloud size={20} />
                <span className="text-xs mt-1">Weather</span>
            </Link>

            {/* <Link
                to="/map"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/map") ? "text-green-600" : "text-gray-500"
                    }`}
            >
                <Map size={20} />
                <span className="text-xs mt-1">Map</span>
            </Link> */}


            <Link
                to="/disease-prediction"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/disease-prediction") ? "text-green-600" : "text-gray-500"
                    }`}
            >
                <Activity size={20} />
                <span className="text-xs mt-1">Disease</span>
            </Link>

            <Link
                to="/profile"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/profile") ? "text-green-600" : "text-gray-500"
                    }`}
            >
                <User size={20} />
                <span className="text-xs mt-1">Profile</span>
            </Link>
        </div>
    )
}

export default BottomNav

