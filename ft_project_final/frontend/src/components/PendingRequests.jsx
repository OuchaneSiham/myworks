function PendingRequests({ pendingReqs, setPendingReqs, fetchFriends }) {
  const handleAccept = async (reqId) => {
    const token = localStorage.getItem("token");

    const resp = await fetch(
      `http://localhost:8281/api/v1/users/accept/${reqId}`,
      {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (resp.ok) {
      setPendingReqs((prev) => prev.filter((r) => r.id !== reqId));
      fetchFriends();
    }
  };

  const handleDecline = async (reqId) => {
    const token = localStorage.getItem("token");

    const resp = await fetch(
      `http://localhost:8281/api/v1/users/friends/request/${reqId}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (resp.ok) {
      setPendingReqs((prev) => prev.filter((r) => r.id !== reqId));
    }
  };

  return (
    <div>
      <h3>Pending Requests ({pendingReqs.length})</h3>

      {pendingReqs.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        pendingReqs.map((req) => (
          <div key={req.id}>
            <img src={req.requester.avatar} width="40" />
            <span>{req.requester.username}</span>

            <button onClick={() => handleAccept(req.id)}>Accept</button>
            <button onClick={() => handleDecline(req.id)}>Decline</button>
          </div>
        ))
      )}
    </div>
  );
}

export default PendingRequests;
