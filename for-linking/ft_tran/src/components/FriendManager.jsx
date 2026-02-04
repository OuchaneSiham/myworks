function FriendManager({ friends }) {
  return (
    <div>
      <h3>My Friends ({friends.length})</h3>

      {friends.length === 0 ? (
        <p>No friends yet</p>
      ) : (
        friends.map((fr) => (
          <div key={fr.id}>
            <img src={fr.avatar} width="40" />
            <span>{fr.username}</span>

            {fr.isOnline ? (
              <span> 🟢 Online</span>
            ) : (
              <span> 🔴 Offline</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default FriendManager;
