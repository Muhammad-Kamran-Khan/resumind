// File: components/WipeApp.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePuter } from '../lib/puter';

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuter();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    try {
      const list = (await fs.readDir("./")) || [];
      setFiles(list);
    } catch (err) {
      console.error("Failed to load files", err);
      setFiles([]);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // wait until loading finishes, then redirect unauthenticated users
    if (!isLoading && auth && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth, navigate]);

  const handleDelete = async () => {
    if (!files || files.length === 0) return;

    const confirmed = window.confirm(
      "This will permanently delete all app files and flush key-value storage. Are you sure?"
    );
    if (!confirmed) return;

    try {
      // delete files in parallel
      await Promise.all(
        files.map(async (file) => {
          try {
            await fs.delete(file.path);
          } catch (err) {
            console.warn("Failed to delete", file.path, err);
          }
        })
      );

      // flush KV store
      if (kv && typeof kv.flush === "function") {
        await kv.flush();
      }

      // reload files
      await loadFiles();
    } catch (err) {
      console.error("Failed to wipe app data", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <div>Error: {String(error)}</div>
        {clearError && (
          <button
            className="mt-2 px-3 py-1 bg-gray-200 rounded"
            onClick={() => clearError()}
          >
            Dismiss
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <strong>Authenticated as:</strong> {auth?.user?.username || "—"}
      </div>

      <div className="mb-4">
        <strong>Existing files:</strong>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {files.length === 0 ? (
          <div className="text-gray-500">No files found.</div>
        ) : (
          files.map((file) => (
            <div
              key={file.id || file.path || file.name}
              className="flex flex-row gap-4 items-center"
            >
              <p>{file.name || file.path}</p>
            </div>
          ))
        )}
      </div>

      <div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer"
          onClick={handleDelete}
        >
          Wipe App Data
        </button>
      </div>
    </div>
  );
};

export default WipeApp;
