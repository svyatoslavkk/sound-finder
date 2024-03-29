import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { app, database } from "../../firebase/firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from "../../components/loader/Loader";
import ColorOverlay from "../../components/colorOverlay/ColorOverlay";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import DoneIcon from "@mui/icons-material/Done";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const navigate = useNavigate();
  const collectionRef = collection(database, "Users Data");

  const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    validateUsername();
    validateEmail();
    validatePassword();
    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const currentUser = auth.currentUser;

      if (currentUser) {
        let pictureUrl = null;

        if (avatar) {
          const storage = getStorage(app);
          const storageRef = ref(
            storage,
            "avatars/" + currentUser?.uid + ".jpg",
          );
          await uploadBytes(storageRef, avatar);
          pictureUrl = await getDownloadURL(storageRef);
        }

        await updateProfile(currentUser, {
          displayName: username,
          photoURL: pictureUrl,
        });

        console.log(response.user);
        const idToken = await currentUser.getIdToken();
        sessionStorage.setItem("Token", idToken);

        const docRef = await addDoc(collectionRef, {
          uid: currentUser.uid,
          userName: username,
          email: currentUser.email,
          favTracks: [],
          recentTracks: [],
          listenedTimes: [],
          listeningStats: {},
          ...(avatar && { avatar: pictureUrl }),
        });

        const docId = docRef.id;

        await updateDoc(doc(collectionRef, docId), {
          docId: docId,
        });

        navigate("/");
      }
    } catch (err: any) {
      console.error("Registration error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = await addDoc(collectionRef, {
        uid: user.uid,
        userName: user.displayName,
        email: user.email,
        favTracks: [],
        recentTracks: [],
        listenedTimes: [],
        listeningStats: {},
        avatar: user.photoURL,
      });
      const docId = docRef.id;
      await updateDoc(doc(collectionRef, docId), { docId: docId });
      navigate("/");
    } catch (error) {
      console.error("Google Sign Up Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = () => {
    if (username.length < 6) {
      setUsernameError("Username should be at least 6 characters");
    } else {
      setUsernameError("");
    }
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("Password should be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="signup">
        <div className="signup-content">
          <div className="column-content" style={{ textAlign: "center" }}>
            <h2 className="big-header-white">Welcome to Music Hub!</h2>
            <p className="mid-text-white">
              Let's get started to listen trend music
            </p>
          </div>
          <form className="auth-form">
            <div className="flex-content">
              <div className="input-div">
                <input
                  className="input"
                  name="file"
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  fill="none"
                  stroke="currentColor"
                  className="icon"
                >
                  <polyline points="16 16 12 12 8 16"></polyline>
                  <line y2="21" x2="12" y1="12" x1="12"></line>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                  <polyline points="16 16 12 12 8 16"></polyline>
                </svg>
              </div>
              {selectedAvatar && (
                <div className="input-div">
                  <img
                    src={selectedAvatar}
                    className="large-circle-img"
                    alt="Selected Avatar"
                  />
                </div>
              )}
            </div>
            <div className="auth-input-section">
              <span className="username-icon">
                <PersonOutlineOutlinedIcon
                  fontSize="inherit"
                  sx={{ color: "#E0E0E0" }}
                />
              </span>
              <input
                type="text"
                className="auth-input"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                onBlur={validateUsername}
              />
              {usernameError ? (
                <span className="alert-icon">
                  <PriorityHighIcon
                    fontSize="inherit"
                    sx={{ color: "#304030" }}
                  />
                </span>
              ) : (
                <span className="done-icon">
                  <DoneIcon fontSize="inherit" sx={{ color: "#304030" }} />
                </span>
              )}
            </div>
            <div className="auth-input-section">
              <span className="username-icon">
                <EmailOutlinedIcon
                  fontSize="inherit"
                  sx={{ color: "#E0E0E0" }}
                />
              </span>
              <input
                type="text"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                onBlur={validateEmail}
              />
              {emailError ? (
                <span className="alert-icon">
                  <PriorityHighIcon
                    fontSize="inherit"
                    sx={{ color: "#304030" }}
                  />
                </span>
              ) : (
                <span className="done-icon">
                  <DoneIcon fontSize="inherit" sx={{ color: "#304030" }} />
                </span>
              )}
            </div>
            <div className="auth-input-section">
              <span className="username-icon">
                <VpnKeyOutlinedIcon
                  fontSize="inherit"
                  sx={{ color: "#E0E0E0" }}
                />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={validatePassword}
              />
              {passwordError ? (
                <span className="alert-icon-password">
                  <PriorityHighIcon
                    fontSize="inherit"
                    sx={{ color: "#304030" }}
                  />
                </span>
              ) : (
                <span className="done-icon-password">
                  <DoneIcon fontSize="inherit" sx={{ color: "#304030" }} />
                </span>
              )}
              <button
                className="visibility-icon"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <VisibilityOffIcon
                    fontSize="small"
                    sx={{ color: "#E0E0E0" }}
                  />
                ) : (
                  <VisibilityIcon fontSize="small" sx={{ color: "#E0E0E0" }} />
                )}
              </button>
            </div>
            <button className="primary-btn" onClick={handleSignUp}>
              <span className="mid-header-dark">Sign Up</span>
            </button>
            <div className="line-block">
              <div className="line"></div>
              <span className="mid-header-white">or</span>
              <div className="line"></div>
            </div>
            <button className="secondary-btn" onClick={handleGoogleSignUp}>
              <GoogleIcon fontSize="small" sx={{ color: "#e4774d" }} />
              <span className="mid-header-white">Sign Up with Google</span>
            </button>
          </form>
          <div className="column-content">
            <p className="mid-text-white">
              Already have an account?{" "}
              <Link
                to="/login"
                className="mid-text-white"
                style={{ color: "#dfbf60", textDecoration: "none" }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      {loading && (
        <div className="overlay">
          <Loader />
        </div>
      )}
      <ColorOverlay />
    </>
  );
}
