// client/src/components/Dashboard.jsx
import { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/search", {
        keyword,
      });
      setResults(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search keyword (e.g. your brand, product)..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <section className="results">
        {results.length === 0 && !loading && <p>No results yet.</p>}
        {results.map((post) => (
          <article key={post.id} className="post-card">
            <h4>{post.platform}</h4>
            <p>{post.text}</p>
            <small>{post.createdAt}</small>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
