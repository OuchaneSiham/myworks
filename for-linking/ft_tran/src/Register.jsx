
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'

function Register(){
    const url = "http://localhost:8281/api/v1/users/register"
    const [formData, setFormData] = useState({});
    const handlechange = (event) =>{
        setFormData({...formData, [event.target.id]: event.target.value})
        console.log(setFormData);
    }
    const navigate = useNavigate();
    const handleSubmit = async (event) =>{
        event.preventDefault();
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await resp.json();
            if (resp.ok) { navigate("/login"); }
            console.log(data);
        }
        catch(error)
        {
            console.log("error is ", error);
        }

    }
    return(
        <>
        <div className="Register Page">
            <form onSubmit={handleSubmit} >
                <div>
                    <label htmlFor="username">username:</label>
                    <input type="text" onChange={handlechange} id="username" name="username" placeholder="enter your username" required></input>
                </div>
                <br></br>
                <div>
                    <label htmlFor="email">email:</label>
                    <input type="text" onChange={handlechange} id="email" name="email" placeholder="enter your email" required></input>
                </div>
                <br></br>
                <div>
                    <label htmlFor="password">password:</label>
                    <input type="password" onChange={handlechange} id="password" name="password" placeholder="enter your password" required ></input>
                </div>
                <br />
                <div>
                <input type="submit" value="sign up"></input>
                </div>
            </form>
            <Link to="/login">Already have an account? Sign in</Link>
        </div>
        </>
    );
}
export default Register