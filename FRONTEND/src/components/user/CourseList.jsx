"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const CourseList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Sending token:", token);

        if (!token) {
          console.error("Token not found");
          return;
        }

        // Make sure this endpoint exists in your Spring Boot backend
        const res = await axios.get("http://localhost:9090/user/video-dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched videos:", res.data);
        setVideos(res.data);
      } catch (error) {
        console.error("Error fetching course videos:", error);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
        }
      }
    };

    fetchVideos();
  }, []);

  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Video Courses</h1>

      <div className="max-w-3xl mx-auto">
        {videos.length > 0 ? (
          <ul className="space-y-4">
            {videos.map((video) => (
              <li
                key={video.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-center d-flex">
                  <div style={{ width: "88%" }}>
                    <h2 className="text-xl font-semibold">{video.title}</h2>
                    <p className="text-gray-500 mt-1">{video.description}</p>
                  </div>

                  <div className="flex gap-2 d-flex">
                    <button
                      onClick={() => openLink(video.videoUrl)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                    >
                      <strong>View</strong>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => openLink(video.videoNotes)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                    >
                      <strong>PDF</strong>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 text-lg">
            No video courses available
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
