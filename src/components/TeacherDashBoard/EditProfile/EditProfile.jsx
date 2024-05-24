import React, { useContext, useEffect, useState } from "react";
import "./EditProfile.css";
import { BsCheck, BsX, BsPencilSquare } from "react-icons/bs";
import { AuthContext } from "../../../context/AuthContext";
import supabase from "../../../config/supabaseClient";
import Swal from "sweetalert2";
import Spinner from "react-bootstrap/Spinner";

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [defaultName, setDefaultName] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onChangePassword() {
    setLoading(true);

    try {
      if (newPassword !== confirmPassword)
        throw new Error("Password does not match");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) throw new Error(error.message);

      const { data: newData, error: newError } = await supabase.auth.updateUser(
        {
          password: newPassword,
        }
      );

      if (newError) throw new Error(newError.message);

      setUser(data.user);
      Swal.fire({
        title: "Saved!",
        text: "Changes has been saved",
        icon: "success",
      });

      setConfirmPassword("");
      setPassword("");
      setNewPassword("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSaveChanges() {
    setIsEditing(false);
    setIsLoading(true);
    const { data, error } = await supabase
      .from("teachers")
      .update({ name: name })
      .eq("uuid", user.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    } else {
      Swal.fire({
        title: "Saved!",
        text: "Changes has been saved",
        icon: "success",
      });
    }
    setIsLoading(false);
  }

  function onCancel() {
    setIsEditing(false);
    setName(defaultName);
  }

  async function getTeacherData() {
    const { data, error } = await supabase
      .from("teachers")
      .select("name")
      .eq("uuid", user.id);

    if (error) console.log(error);

    setName(data[0].name);
    setDefaultName(data[0].name);
  }

  useEffect(() => {
    getTeacherData();
  }, [user]);

  return (
    <div className="edit-teacher-profile-container">
      <h1>Edit Teacher Profile</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group" style={{ position: "relative" }}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              position: "absolute",
              right: "200px",
              top: "48px",
            }}
          >
            {isEditing ? (
              <>
                <BsCheck onClick={onSaveChanges} size={"24px"} />
                <BsX size={"24"} onClick={onCancel} />
              </>
            ) : (
              <BsPencilSquare
                onClick={() => setIsEditing(true)}
                size={"24px"}
              />
            )}
          </div>
          {isLoading && (
            <Spinner
              size="sm"
              animation="border"
              role="status"
              style={{ marginLeft: "8px" }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Current Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New password</label>
          <input
            type="password"
            id="new-password"
            name="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            name="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </div>
        <button type="button" onClick={onChangePassword} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
