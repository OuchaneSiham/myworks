import { API_BASE_URL } from './config';
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

function Register() {
    const url = `${API_BASE_URL}/users/register`
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();
    
    const handlechange = (event) => {
        setFormData({...formData, [event.target.id]: event.target.value})
    }
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            
            if (resp.ok) {
                const data = await resp.json();
                alert("Registration successful! Please login.");
                navigate("/login");
            } else {
                const data = await resp.json();
                alert(data.error || data || "Registration failed!");
            }
        }
        catch(error) {
            console.log("error is", error);
            alert("Network error. Please try again.");
        }
    }
    
    return (
        <>
            <div className="Register Page">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">username:</label>
                        <input type="text" onChange={handlechange} id="username" name="username" placeholder="enter your username" required />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="email">email:</label>
                        <input type="email" onChange={handlechange} id="email" name="email" placeholder="enter your email" required />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="password">password:</label>
                        <input type="password" onChange={handlechange} id="password" name="password" placeholder="enter your password" required />
                    </div>
                    <br />
                    <div>
                        <input type="submit" value="sign up" />
                    </div>
                </form>
                <Link to="/login">Already have an account? Sign in</Link>
            </div>
        </>
    );
}

export default Register