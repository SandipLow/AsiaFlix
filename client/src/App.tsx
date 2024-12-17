import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Film, User } from 'lucide-react';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
import Edit from './pages/Edit';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? element : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const user = useAuthStore((state) => state.user);
    return user?.role === 'admin' ? element : <Navigate to="/" />;
};

const UnAuthRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return !isAuthenticated ? element : <Navigate to="/" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<UnAuthRoute element={<Login/>} />} />
                <Route path="/signup" element={<UnAuthRoute element={<Signup/>} />} />

                <Route path="/" element={<Layout />}>
                    <Route index element={<PrivateRoute element={<Home />} />} />
                    <Route path="/watch/:videoId" element={<PrivateRoute element={<Watch />} />} />
                    <Route path='/profile' element={<PrivateRoute element={<Profile/>} />} />
                    <Route path='/edit/:videoId' element={<PrivateRoute element={<Edit/>} />} />
                    <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const Layout = () => {

    const { isAuthenticated, user, loading, fetchUser, subscribed, subscribe } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);


    return (
        <>
            {
                loading ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) :
                isAuthenticated && (
                    <nav className="bg-gray-800 text-white shadow-md shadow-blue-600 fixed top-0 w-full z-50">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between h-16">
                                <NavLink to={"/"}>
                                    <div className="flex items-center">
                                        <Film className="w-8 h-8 text-blue-600" />
                                        <span className="ml-2 text-xl font-bold">AsiaFlix</span>
                                    </div>
                                </NavLink>

                                <div className="flex items-center space-x-4">
                                    {user?.role === 'admin' && (
                                        <NavLink to={"/admin"} className="text-gray-100 hover:text-gray-200">
                                            Admin Dashboard
                                        </NavLink>
                                    )}

                                    {/* Subscribe */}
                                    <button onClick={subscribe} className={`rounded-md ${ !subscribed ? "bg-blue-600 hover:bg-blue-800" : "bg-blue-400" } text-white m-2 p-2`}>
                                        {subscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>

                                    {/* Profile */}
                                    <NavLink to="/profile" className='rounded-full bg-blue-600 text-white m-2 p-2'>
                                        <User className="w-5 h-5 font-extrabold" />
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </nav>
                )
            }
            
            {<Outlet />}
        </>
    );
};

export default App;