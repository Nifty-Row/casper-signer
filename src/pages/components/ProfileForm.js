import { useState } from 'react';
import Image from "next/image";


const ProfileForm = ({activekey, userData }) => {
  // let userData = userData || {};
  // alert(JSON.stringify(userData));
  const [displayName, setDisplayName] = useState(userData.fullName || '');
  const [username, setUsername] = useState(userData.username || '');
  const [bio, setBio] = useState(userData.about || '');
  const [email, setEmail] = useState(userData.email || '');
  const [facebook, setFacebook] = useState(userData.facebook || '');
  const [twitter, setTwitter] = useState(userData.twitter || '');
  const [instagram, setInstagram] = useState(userData.instagram || '');
  const [linkedin, setLinkedin] = useState(userData.linkedin || '/img_405324.png');
  const [category, setCategory] = useState(userData.category || '');
  const [website, setWebsite] = useState(userData.website || '');
  const [activeKey, setActiveKey] = useState(userData.publicKey || '');
  function handleSubmit() {
    const displayName = document.getElementById("displayName").value;
    const username = document.getElementById("displayUserName").value;
    const bio = document.getElementById("bio").value;
    // const email = document.getElementById("emailAddress").value;
    const facebookLink = document.getElementById("facebookLink").value;
    const twitterLink = document.getElementById("twitterLink").value;
    const instagramLink = document.getElementById("instagramLink").value;
    const webLink = document.getElementById("webLink").value;
  
    // Send a separate request for each individual update
    updateProfileField("fullName", displayName);
    updateProfileField("username", username);
    updateProfileField("about", bio);
    // updateProfileField("email", email);
    updateProfileField("facebook", facebookLink);
    updateProfileField("twitter", twitterLink);
    updateProfileField("instagram", instagramLink);
    updateProfileField("website", webLink);
  }
  
  async function updateProfileField(column, value) {
    if(!value) return;
    try {
      swal({
        title: "Submitting...",
        text: `Updating ${column}`,
        icon: "info",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
      });
      const publicKey = userData.publicKey; // Replace with the actual user's public key
      const response = await fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/user/${publicKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ column, value }),
      });
  
      if (response.ok) {
        swal(
          "Success",
          `Successfully updated ${column}`,
          "success"
        );
        console.log(`Successfully updated ${column}`);
      } else {
        console.error(`Failed to update ${column}`);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  }

  return (
    <div className="profile-setting-panel">
      <h5 className="mb-4">Edit Profile</h5>
      <div className="d-flex align-items-center">
        <div className="image-result-area avatar avatar-3">
          <Image id="image-result" width={100} height={100} src={linkedin} alt="Profile Image" />
        </div>
        {/* <input className="upload-image" disabled data-target="image-result" id="upload-image-file" type="file" hidden /> */}
        <label htmlFor="upload-image-file" className="upload-image-label btn btn-dark">Update Photo</label>
      </div>
      <div className="row mt-4">
        <div className="col-lg-6 mb-3">
          <label htmlFor="userCategory" className="form-label"> User Category</label>
          <input type="text" id="userCategory" className="form-control form-control-s1" value={category} disabled />
        </div>
        <div className="col-lg-6 mb-3">
          <label htmlFor="displayName" className="form-label">Display Name</label>
          <input type="text" id="displayName" className="form-control form-control-s1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="col-lg-6 mb-3">
          <label htmlFor="displayUserName" className="form-label">Username</label>
          <input type="text" id="displayUserName" className="form-control form-control-s1" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="bio" className="form-label">Bio</label>
        <textarea className="form-control form-control-s1" placeholder="Leave a comment here" id="bio" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
      </div>
      
      <div className="row">
        <div className="col-lg-6 mb-3">
          <label htmlFor="facebookLink" className="form-label">Facebook Link</label>
          <input type="text" id="facebookLink" className="form-control form-control-s1" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div className="col-lg-6 mb-3">
          <label htmlFor="twitterLink" className="form-label">Twitter Link</label>
          <input type="text" id="twitterLink" className="form-control form-control-s1" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
        </div>
        <div className="col-lg-6 mb-3">
          <label htmlFor="instagramLink" className="form-label">Instagram Link</label>
          <input type="text" id="instagramLink" className="form-control form-control-s1" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="col-lg-6 mb-3">
          <label htmlFor="webLink" className="form-label">Website Link</label>
          <input type="text" id="webLink" className="form-control form-control-s1" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </div>
      <button className="btn btn-dark mt-3" type="button" onClick={handleSubmit}>Update Profile</button>
    </div>
  );
}
export default ProfileForm;