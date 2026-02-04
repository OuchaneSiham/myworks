import { API_BASE_URL } from './config';
import {useEffect, useState} from "react"
import {Link, useNavigate} from 'react-router-dom'

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();
    
    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        
        try {
            const resp = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { "Authorization": "Bearer " + token }
            });
            
            if (resp.ok) {
                const data = await resp.json();
                setUsers(data);
            } else {
                console.log("Failed to fetch users");
            }
        } catch(error) {
            console.log("Error:", error);
        }
    }
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleDelete = async (userId, username) => {
        const confirmed = window.confirm(`Delete user ${username}?`);
        if (!confirmed) return;
        
        const token = localStorage.getItem("token");
        
        try {
            const resp = await fetch(`${API_BASE_URL}/users/users/${userId}`, { // ✅ FIXED
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            
            if (resp.ok) {
                setUsers(users.filter(u => u.id !== userId));
                alert("User deleted successfully!");
            } else {
                alert("Failed to delete user");
            }
        } catch(error) {
            console.log("Error:", error);
        }
    }
    
    const startEdit = (user) => {
        setEditingUser(user);
    }
    
    const closeEdit = () => {
        setEditingUser(null);
        fetchUsers();
    }
    
    return (
        <div>
            <h1>Manage Users</h1>
            <Link to="/admin">
                <button>Back to Dashboard</button>
            </Link>
            
            <div>
                <h2>All Users ({users.length})</h2>
                {users.map(user => (
                    <div key={user.id} style={{border: "1px solid gray", margin: "10px", padding: "10px"}}>
                        <img src={user.avatar} width="50" alt={user.username} />
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Status:</strong> {user.isOnline ? "🟢 Online" : "🔴 Offline"}</p>
                        
                        <button onClick={() => startEdit(user)}>Edit</button>
                        <button onClick={() => handleDelete(user.id, user.username)}>Delete</button>
                    </div>
                ))}
            </div>
            
            {editingUser && (
                <EditForm 
                    user={editingUser} 
                    onClose={closeEdit}
                />
            )}
        </div>
    )
}

function EditForm({ user, onClose }) {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        
        try {
            const resp = await fetch(`${API_BASE_URL}/users/admin/users/${user.id}`, { // ✅ FIXED
                method: "PATCH",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, role })
            });
            
            if (resp.ok) {
                alert("User updated successfully!");
                onClose();
            } else {
                const data = await resp.json();
                alert("Failed: " + (data.message || "Error"));
            }
        } catch(error) {
            console.log("Error:", error);
            alert("Error updating user");
        }
    }
    
    return (
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            border: "2px solid black",
            padding: "20px",
            zIndex: 1000
        }}>
            <h2>Edit User: {user.username}</h2>
            
            <div>
                <label>Username:</label>
                <input 
                    type="text"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            
            <div>
                <label>Email:</label>
                <input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div>
                <label>Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                </select>
            </div>
            
            <button onClick={handleSubmit}>Save Changes</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    )
}

export default AdminUsers;