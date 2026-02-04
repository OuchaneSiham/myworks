import { API_BASE_URL } from './config';
import {useEffect, useState} from "react"
import {Link, useNavigate} from 'react-router-dom'

function AdminDashboard()
{
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const getToken = localStorage.getItem("token");
        
        if(!getToken) {
            navigate("/login");
            return;
        }
        
        const checkAdmin = async () => {
            try {
                const resp = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { "Authorization": "Bearer " + getToken }
                });
                
                if (resp.ok) {
                    const data = await resp.json();
                    
                    if (data.role === "admin") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                }
                
                setIsLoading(false);
                
            } catch(error) {
                console.log("Error checking admin:", error);
                setIsLoading(false);
            }
        }
        
        checkAdmin();
        
    }, []);
    
    if (isLoading) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        )
    }
    
    if (!isAdmin) {
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You must be an admin to view this page.</p>
                <Link to="/profile">Back to Profile</Link>
            </div>
        )
    }
    
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin!</p>
            <Link to="/admin/users">
                <button>Manage Users</button>
            </Link>
            <br/>
            <Link to="/profile">
                <button>Back to Profile</button>
            </Link>
        </div>
    );
}

export default AdminDashboard;