import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUbrq-iHJclZcJU7XZEeYmHineBNavWFM",
  authDomain: "family-gourmet.firebaseapp.com",
  databaseURL: "https://family-gourmet-default-rtdb.firebaseio.com",
  projectId: "family-gourmet",
  storageBucket: "family-gourmet.firebasestorage.app",
  messagingSenderId: "104599337176",
  appId: "1:104599337176:web:d64c08c18e9b6ba0373fad",
};

const CLOUDINARY_CLOUD_NAME = "dlbqujd0f";
const CLOUDINARY_UPLOAD_PRESET = "oquiouyf";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const GENRES = ["和食", "洋食", "中華", "イタリアン", "フレンチ", "焼肉", "寿司", "ラーメン", "カフェ", "その他"];

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? "filled" : ""} ${readonly ? "readonly" : ""}`}
          onClick={() => !readonly && onChange(s)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo-area">
          <div className="logo-icon">🍽️</div>
          <h1 className="app-title">Family Gourmet</h1>
          <p className="app-subtitle">家族のおいしい思い出を記録しよう</p>
        </div>
        <button className="google-btn" onClick={onLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

function AddRestaurantModal({ onClose, onSave, user }) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("お店の名前を入力してください");
    setUploading(true);
    try {
      let photoUrl = null;
      if (photo) photoUrl = await uploadToCloudinary(photo);
      await addDoc(collection(db, "restaurants"), {
        name,
        genre,
        location,
        createdAt: new Date(),
        createdBy: user.displayName,
        reviews: [
          {
            uid: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            rating,
            comment,
            photoUrl,
            createdAt: new Date().toISOString(),
          },
        ],
      });
      onSave();
    } catch (e) {
      alert("保存に失敗しました: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>お店を追加</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label>お店の名前 *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：すし屋 銀座店" />
          <label>ジャンル</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <label>場所・住所</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例：東京都中央区銀座" />
          <label>評価</label>
          <StarRating value={rating} onChange={setRating} />
          <label>コメント</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="感想を書いてください" rows={3} />
          <label>写真</label>
          <div className="photo-upload">
            <input type="file" accept="image/*" onChange={handlePhoto} id="photo-input" />
            <label htmlFor="photo-input" className="photo-label">
              📷 写真を選ぶ
            </label>
            {photoPreview && <img src={photoPreview} className="photo-preview" alt="preview" />}
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>キャンセル</button>
          <button className="save-btn" onClick={handleSave} disabled={uploading}>
            {uploading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddReviewModal({ restaurant, onClose, onSave, user }) {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      let photoUrl = null;
      if (photo) photoUrl = await uploadToCloudinary(photo);
      const ref = doc(db, "restaurants", restaurant.id);
      await updateDoc(ref, {
        reviews: arrayUnion({
          uid: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          rating,
          comment,
          photoUrl,
          createdAt: new Date().toISOString(),
        }),
      });
      onSave();
    } catch (e) {
      alert("保存に失敗しました: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>レビューを追加</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="review-target">📍 {restaurant.name}</p>
          <label>評価</label>
          <StarRating value={rating} onChange={setRating} />
          <label>コメント</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="感想を書いてください" rows={3} />
          <label>写真</label>
          <div className="photo-upload">
            <input type="file" accept="image/*" onChange={handlePhoto} id="review-photo-input" />
            <label htmlFor="review-photo-input" className="photo-label">📷 写真を選ぶ</label>
            {photoPreview && <img src={photoPreview} className="photo-preview" alt="preview" />}
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>キャンセル</button>
          <button className="save-btn" onClick={handleSave} disabled={uploading}>
            {uploading ? "保存中..." : "投稿する"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RestaurantDetail({ restaurant, onClose, user }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [current, setCurrent] = useState(restaurant);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "restaurants", restaurant.id), (snap) => {
      if (snap.exists()) setCurrent({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [restaurant.id]);

  const avgRating = current.reviews?.length
    ? (current.reviews.reduce((a, r) => a + r.rating, 0) / current.reviews.length).toFixed(1)
    : "-";

  return (
    <div className="detail-screen">
      <div className="detail-header">
        <button className="back-btn" onClick={onClose}>← 戻る</button>
        <div>
          <h2>{current.name}</h2>
          <span className="genre-badge">{current.genre}</span>
          {current.location && <span className="location-text">📍 {current.location}</span>}
        </div>
        <div className="avg-rating">
          <span className="avg-score">{avgRating}</span>
          <span className="avg-star">★</span>
        </div>
      </div>

      <div className="reviews-list">
        {current.reviews?.map((r, i) => (
          <div key={i} className="review-card">
            <div className="review-top">
              <img src={r.userPhoto || "/default-avatar.png"} className="avatar" alt="" />
              <div>
                <div className="reviewer-name">{r.userName}</div>
                <StarRating value={r.rating} readonly />
              </div>
              <div className="review-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("ja-JP") : ""}</div>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
            {r.photoUrl && <img src={r.photoUrl} className="review-photo" alt="review" />}
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => setShowReviewModal(true)}>＋ レビューを追加</button>

      {showReviewModal && (
        <AddReviewModal
          restaurant={current}
          user={user}
          onClose={() => setShowReviewModal(false)}
          onSave={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterGenre, setFilterGenre] = useState("すべて");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      alert("ログインに失敗しました");
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (selected) return <RestaurantDetail restaurant={selected} user={user} onClose={() => setSelected(null)} />;

  const filtered = filterGenre === "すべて"
    ? restaurants
    : restaurants.filter((r) => r.genre === filterGenre);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Family Gourmet</h1>
        <div className="header-right">
          <img src={user.photoURL} className="user-avatar" alt="" />
          <button className="logout-btn" onClick={() => signOut(auth)}>ログアウト</button>
        </div>
      </header>

      <div className="filter-bar">
        {["すべて", ...GENRES].map((g) => (
          <button
            key={g}
            className={`filter-btn ${filterGenre === g ? "active" : ""}`}
            onClick={() => setFilterGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="restaurant-grid">
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>まだお店が登録されていません</p>
            <p>右下の＋ボタンで追加しましょう！</p>
          </div>
        )}
        {filtered.map((r) => {
          const avg = r.reviews?.length
            ? (r.reviews.reduce((a, rv) => a + rv.rating, 0) / r.reviews.length).toFixed(1)
            : "-";
          const photo = r.reviews?.find((rv) => rv.photoUrl)?.photoUrl;
          return (
            <div key={r.id} className="restaurant-card" onClick={() => setSelected(r)}>
              <div className="card-photo">
                {photo ? <img src={photo} alt="" /> : <div className="no-photo">🍴</div>}
              </div>
              <div className="card-info">
                <span className="card-genre">{r.genre}</span>
                <h3 className="card-name">{r.name}</h3>
                {r.location && <p className="card-location">📍 {r.location}</p>}
                <div className="card-bottom">
                  <span className="card-rating">★ {avg}</span>
                  <span className="card-reviews">{r.reviews?.length || 0}件のレビュー</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)}>＋</button>

      {showAddModal && (
        <AddRestaurantModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onSave={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
