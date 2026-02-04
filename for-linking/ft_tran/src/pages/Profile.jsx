import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ProfileEditor from "../components/ProfileEditor";
import PendingRequests from "../components/PendingRequests";
import FriendSearch from "../components/FriendSearch";
import FriendManager from "../components/FriendManager";

function Profile() {
  const urlMe = "http://localhost:8281/api/v1/users/me";
  const urlUp = "http://localhost:8281/api/v1/users/update";

  const [userData, setUserData] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [isEdit, setEdit] = useState(false);

  const [pendingReqs, setPendingReqs] = useState([]);
  const [friends, setFriends] = useState([]);

  const [query, setQuery] = useState("");
  const [searchReqs, setSearchReqs] = useState([]);

  const navigate = useNavigate();

  // -----------------------------
  // FETCH FUNCTIONS
  // -----------------------------
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    const resp = await fetch(urlMe, {
      headers: { Authorization: "Bearer " + token },
    });

    if (resp.ok) {
      const data = await resp.json();
      setUserData(data);
      setUpdatedData({ ...data, password: "" });
    }
  };

  const fetchPending = async () => {
    const token = localStorage.getItem("token");

    const resp = await fetch(
      "http://localhost:8281/api/v1/users/friends/pending",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      setPendingReqs(data);
    }
  };

  const fetchFriends = async () => {
    const token = localStorage.getItem("token");

    const resp = await fetch(
      "http://localhost:8281/api/v1/users/friends/list",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      setFriends(data);
    }
  };

  // -----------------------------
  // ON PAGE LOAD
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    fetchProfile();
    fetchPending();
    fetchFriends();
  }, []);

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    let dataToSend = { ...updatedData };
    if (!dataToSend.password) delete dataToSend.password;

    const resp = await fetch(urlUp, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (resp.ok) {
      const data = await resp.json();
      setUserData(data);
      setUpdatedData({ ...data, password: "" });
      setEdit(false);
    }
  };

  const handleAvatarChange = async (file) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("avatar", file);

    const resp = await fetch(urlUp, {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    if (resp.ok) {
      const data = await resp.json();
      setUserData(data.user);
      setUpdatedData({ ...data.user, password: "" });
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8281/api/v1/users/logout", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });

    localStorage.removeItem("token");
    navigate("/");
  };

  if (!userData) return <h1>Loading...</h1>;

  return (
    <>
      {/* PROFILE EDITOR */}
      <ProfileEditor
        userData={userData}
        updatedData={updatedData}
        setUpdatedData={setUpdatedData}
        isEdit={isEdit}
        setEdit={setEdit}
        onSave={handleSave}
        onAvatarChange={handleAvatarChange}
      />

      {/* PENDING REQUESTS */}
      <PendingRequests
        pendingReqs={pendingReqs}
        setPendingReqs={setPendingReqs}
        fetchFriends={fetchFriends}
      />

      {/* SEARCH */}
      <FriendSearch
        query={query}
        setQuery={setQuery}
        searchReqs={searchReqs}
        setSearchReqs={setSearchReqs}
      />

      {/* FRIEND LIST */}
      <FriendManager friends={friends} />

      <button onClick={handleLogout}>Logout</button>

      {/* ADMIN */}
      {userData.role === "admin" && (
        <Link to="/admin">
          <button>Admin Dashboard</button>
        </Link>
      )}
    </>
  );
}

export default Profile;
