function ProfileEditor({
  userData,
  updatedData,
  setUpdatedData,
  isEdit,
  setEdit,
  onSave,
  onAvatarChange,
}) {
  const handleChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {isEdit ? (
        <>
          <input
            name="username"
            value={updatedData.username}
            onChange={handleChange}
          />

          <input
            name="email"
            value={updatedData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            value={updatedData.password}
            onChange={handleChange}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => onAvatarChange(e.target.files[0])}
          />

          <button onClick={onSave}>Save</button>
          <button onClick={() => setEdit(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h1>Welcome {userData.username}</h1>
          <p>Email: {userData.email}</p>
          <button onClick={() => setEdit(true)}>Edit Profile</button>
        </>
      )}

      <img src={userData.avatar} alt="avatar" width="100" />
    </div>
  );
}

export default ProfileEditor;
