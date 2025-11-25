import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import dayjs from "dayjs";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [previewPic, setPreviewPic] = useState("");

  const defaultPic = "https://i.ibb.co/2k5Y4jF/default-avatar.png";

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/auth/profile");
      setUser(res.data);
      setNewName(res.data.name);
      setPreviewPic(res.data.profilePic || defaultPic);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Convert uploaded image → Base64
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPic(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", {
        name: newName,
        profilePic: previewPic,
      });

      // Update frontend
      setUser(res.data.user);

      // Update localStorage (Navbar reads from here)
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("profilePic", res.data.user.profilePic);

      alert("Profile updated!");

      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Failed to load profile</p>;

  const level = Math.floor(user.totalXP / 200) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-md">

          <h1 className="text-3xl font-bold text-indigo-600 mb-4">
            👤 Profile
          </h1>

          {/* Profile Picture + Name */}
          <div className="flex items-center gap-6 mb-6">
            <img
              src={user.profilePic || defaultPic}
              className="w-24 h-24 rounded-full border border-indigo-300 object-cover"
            />

            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-lg">
            <p><strong>Total XP:</strong> ⭐ {user.totalXP}</p>

            <p>
              <strong>Level:</strong>{" "}
              <span className="ml-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {level}
              </span>
            </p>

            <p>
              <strong>Member Since:</strong>{" "}
              {dayjs(user.createdAt).format("DD MMM YYYY")}
            </p>
          </div>

          <button
           // onClick={() => setIsEditing(true)}
            className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* ------------------------------ */}
      {/* EDIT PROFILE MODAL */}
      {/* ------------------------------ */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Edit Profile</h2>

            {/* Image Preview */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={previewPic}
                className="w-28 h-28 rounded-full border object-cover"
              />
              <label className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer">
                Upload Photo
                <input type="file" className="hidden" onChange={handlePicUpload} />
              </label>
            </div>

            <label className="block mb-2 text-gray-700 font-medium">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
