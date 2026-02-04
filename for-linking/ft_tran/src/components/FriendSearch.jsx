function FriendSearch({ query, setQuery, searchReqs, setSearchReqs }) {
  const handleSearch = async () => {
    const token = localStorage.getItem("token");

    if (query.length < 2) return;

    const resp = await fetch(
      `http://localhost:8281/api/v1/users/search?q=${query}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const result = await resp.json();
    setSearchReqs(result.data);
  };

  const handleSendRequest = async (targetId) => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8281/api/v1/users/friends/request/${targetId}`,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      }
    );
  };

  return (
    <div>
      <h3>Search Friends</h3>

      <input
        value={query}
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      {searchReqs.map((user) => (
        <div key={user.id}>
          {user.username}
          <button onClick={() => handleSendRequest(user.id)}>Add</button>
        </div>
      ))}
    </div>
  );
}

export default FriendSearch;
