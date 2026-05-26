import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, Send, Trash2 } from "lucide-react";
import api from "../config/api";
import { extractList } from "../utils/backendAdapters";

const ShowPostPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts/");
      setPosts(extractList(res.data, ["posts", "results"]));
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load posts");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Write something before posting");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/posts/", {
        content: content.trim(),
        image: image.trim() || null,
      });
      setPosts((prev) => [res.data, ...prev]);
      setContent("");
      setImage("");
      toast.success("Post published");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not publish post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}/`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete post");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Feed</h1>
        <p className="text-muted-foreground mt-2">
          Share updates and see posts from the community.
        </p>
      </div>

      <form onSubmit={handleCreatePost} className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share an update..."
          className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Optional image URL"
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
          Loading feed...
        </div>
      ) : posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex justify-between gap-4 mb-3">
                <div>
                  <p className="font-black">{post.author_name || post.author_email || "Community member"}</p>
                  <p className="text-xs text-muted-foreground">{post.created_at || ""}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-foreground leading-7 whitespace-pre-wrap">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="" className="mt-4 rounded-xl border border-border max-h-96 w-full object-cover" />
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center bg-card border border-border rounded-2xl p-12 text-muted-foreground">
          No posts yet.
        </div>
      )}
    </div>
  );
};

export default ShowPostPage;
