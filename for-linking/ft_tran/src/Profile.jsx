import {useEffect, useState, } from "react"
import { Link, useNavigate } from 'react-router-dom'


function Profile()
{
  const urlme = "http://localhost:8281/api/v1/users/me"
  const urlup = "http://localhost:8281/api/v1/users/update"
  // const urlsearch = "http://localhost:8281/api/v1/users/search"
  const [userData, setUserData] = useState(null);
  // hady for user data lijayani mn back setitha l null hiatch ba9i maendich data
  
  const [isEdit, setEdit] = useState(false);
  // hna f l7ala dyal editing ila kan false y3ni off ghir ghady nbyno data
  // walakin lakant true ghady n editiw data y3ni nktbo ach bghina n editiw
  
  const [updatedData, setUpdatedData] = useState({});
  const [query, setQuery] = useState('');
  const [searchReqs, setSearchReqs] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasPend, setHasPend] = useState(false);
  const [pendingReqs, setPendingReqs] = useState([]);


  // console.log("DRAFT STATE:", updatedData);
    // hady a second copy from the original data li ghady n editiw

    const navigate = useNavigate();
    // hady for navigtiw f pages blaa  nrefriwshiw hadchy kayw93 ghir f memory machy f browser

    // console.log("something");
    const fetchPending = async () =>{
      const getToken = localStorage.getItem("token");
      try{

        const resp = await fetch( "http://localhost:8281/api/v1/users/friends/pending", 
        {
            headers: { "Authorization": "Bearer " + getToken }
        })
            if(resp.ok)
              {
              const data = await resp.json();
              setPendingReqs(data);// here when we fetch pending we recive all the frindhsip record with its requester data

              console.log(data, "database object returning from pending api");
            }
      }
      catch(error)
      {

      }
    }
    useEffect(()=>{
      // hady ghay nruniwha mra whda 
       const getToken = localStorage.getItem("token");
       // fhad l7ala anjibo dak token li setinah f localstorage 
       if(!getToken)
        {
            navigate("/login");
        }
    // console.log("the token that ii get is :" , getToken);
    // hnaya kancreayiw wahd http request lbackend kan3tiwh lheader w token
    // bach back ghady ychekiw f verify ila kan s7i7 ghady y3tini data dyal dak user by id
    const fetchProfile = async () =>{
        try{
            const resp = await fetch(urlme, {
                headers: { "Authorization": "Bearer " + getToken }
            })
            if(resp.ok)
              {
              const data = await resp.json();
              setUserData(data);
              setUpdatedData(data);
              console.log(data, "database user1");
              // ila kant resposnse mzyana kanakhdo data lijatna mn back kan7toha f object
            }
            else 
            {
                console.log("server error222");
            }
        }
        catch(err){
          console.log("ups something wrong while fetching  the data try again!!");
        }
    }
    fetchProfile();
    fetchPending();
    }, []);
    const handleSearch = async () =>{
      const getToken = localStorage.getItem("token");

      if(query.length < 2) return ;
      try{
        const data = await fetch(`http://localhost:8281/api/v1/users/search?q=${query}`, {
          headers: {"Authorization": "Bearer " + getToken},
        });
        // console.log("the data is ", data);
        const result = await data.json();
        setSearchReqs(result.data);
        setHasSearched(true);
        setHasPend(true);
        console.log("the result is", result.data);
      }
      catch(error){

      }
    }
    const handleAccept = async(reqId) =>{
      const getToken = localStorage.getItem("token");
      try{
        const data = await fetch(`http://localhost:8281/api/v1/users/accept/${reqId}`,{
          headers: {"Authorization": "Bearer " + getToken},
          method: "PATCH",
        });
        if(data.ok)
        {
          setPendingReqs(prev => prev.filter(r => r.id !== reqId))

        }
      }
      catch(err){

      }
    }
    const handleDecline = async(reqId) =>{
      const getToken = localStorage.getItem("token");
      try{
        const data = await fetch(`http://localhost:8281/api/v1/users/friends/request/${reqId}`,{
          headers: {"Authorization": "Bearer " + getToken},
          method: "delete",
        });
        if(data.ok)
        {
          setPendingReqs(prev => prev.filter(r => r.id !== reqId))
        }
      }
      catch(err){

      }
    }
    const handleSendRequest = async (targetId) =>{
      const getToken = localStorage.getItem("token");
      try{
        const resp = await fetch(`http://localhost:8281/api/v1/users/friends/request/${targetId}`, {
          headers: {"Authorization": "Bearer " + getToken},
          method: "POST",

        });
          if(resp.ok)
          {
            // const data = await resp.json();
            // setPendingReqs(prev => prev.filter(r => r.id !== reqId))
            // console.log(data, "database user");
          }
      }
      catch(error){

      }
    }
    const handleSave = async () =>{
      const getToken =  localStorage.getItem("token");
      let dataToSend = { ...updatedData };
      if (!dataToSend.password)
          delete dataToSend.password;
      try{
        const resp = await fetch(urlup, {
          headers: { "Authorization": "Bearer " + getToken , 
          "Content-Type" : "application/json"},
          method: "PATCH",
          body: JSON.stringify(dataToSend)
        })
        if(resp.ok)
          {
            const data = await resp.json();
            setUserData(data);
            setEdit(false);
            // setUpdatedData(data);
            setUpdatedData({ ...data, password: "" });
            console.log(data, "database user2");
          }
          else{
            console.log("server error111");
            // alert(data.message)
          }
      }
      catch(err)
      {
        console.log("ups something wrong while updating the data try again!!");
      }
    }
    const handleUpdateChange = (event) =>{
      const name = event.target.name;
      const value = event.target.value;
      setUpdatedData({...updatedData, [name]:value})
      // console.log("field:", name, "||typed", value);
    }
    const handleAvatarChange = async (event) =>{
      const file = event.target.files[0];
      const formDada = new FormData();
      formDada.append('avatar', file);
      const getToken =  localStorage.getItem("token");
      try{

        const resp =  await fetch(urlup, {
          headers: { "Authorization": "Bearer " + getToken },
          method: "PATCH",
          body: formDada
        })
        if(resp.ok){
            const data = await resp.json();
            setUserData(data.user);
            setUpdatedData(data.user);
            console.log("Avatar updated in DB and State!");
        }
      }
      catch(err){

      }
    }
    const handleLogout = async () => {
      const getToken =  localStorage.getItem("token");
      try{
        const logg = await fetch("http://localhost:8281/api/v1/users/logout", {
          headers: { "Authorization": "Bearer " + getToken },
          method: "POST",
        })
        if(logg.ok){
          await localStorage.removeItem('token');
          navigate('/');
        }
      }
      catch(error){

      }
      }
    if(!userData)
    {
        return (<>
        <h1>"Loading..."</h1>
        </>)
    }
    return (
        <>
          <div>
            {isEdit ? (
              <>
                <input
                name="username"
                  type="text"
                  placeholder="modify username"
                  value={updatedData.username}
                  onChange={handleUpdateChange}
                />
                <input
                name="email"
                  type="email"
                  placeholder="modify email"
                  value={updatedData.email}
                  onChange={handleUpdateChange}
                />
                <input
                // i added that for pass
                  name="password"
                  type="password"
                  placeholder="modify password"
                  value={updatedData.password}
                  onChange={handleUpdateChange}
                />
                <input
                // name="email"
                  type="file"
                  accept="image/*"
                  // value={updatedData.avatar}
                  onChange={handleAvatarChange}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEdit(false)}>Cancel</button>
              </>
            ) : (
              <>
                <h1>welcome back to ur data {userData.username}</h1>
                <p>Email: {userData.email}</p>
      
                <button onClick={() => setEdit(true)}>Edit Profile</button>
              </>
            )}
            <img src={userData.avatar} alt="Profile Avatar" />
            <br></br>
              <div>
                <h3>pending requests ({pendingReqs.length})</h3>
                { pendingReqs.length> 0  || !hasPend?
                (
                  pendingReqs.map((req) => (
                    <div key={req.id}>
                      <img src={req.requester.avatar}></img>
                      <span>{req.requester.username}</span>
                      <button onClick={() => handleAccept(req.id)}>accept</button>
                      <button onClick={() => handleDecline(req.id)}>decline</button>
                    </div>
                  ))
                ): (<p>no pending requests</p>)
                }
              </div>
            <h3> search of friends</h3>
            <div>
              <input
              type="text"
              placeholder="search for new friends"
              value={query}
              // onChange={handleSearch}
              onChange={(event) => setQuery(event.target.value)}
              >
              </input>
              <button onClick={handleSearch}>Search</button>
              {/* if()/ */}
            </div>

            <div>
              {searchReqs.length > 0 ||  !hasSearched?
              (searchReqs.map((user) => 
                (<div>
                  {user.username}
                  <button onClick= {() => handleSendRequest(user.id)}>Add friend</button> 
                </div>)))
              :(<p>No users found</p>) }
            </div>
            <button onClick={handleLogout}>logout</button>
      
          </div>
        </>
      );
    }
    export default Profile