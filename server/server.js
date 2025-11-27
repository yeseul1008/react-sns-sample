const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const userRouter = require("./routes/user");

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", userRouter);
app.use("/feed", require("./routes/feed"));


// Last.fm 전체 검색 API
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "검색어 필요" });

  const apiKey = "78b9b4c52313949c2ce8178e0f9b9d46";
  const limit = 100; // 한 번에 가져올 최대 수
  const maxPages = 5; // 예: 최대 5페이지까지 가져오기 (총 500곡)
  let allTracks = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(q)}&api_key=${apiKey}&format=json&limit=${limit}&page=${page}`;
      const response = await fetch(url);
      const data = await response.json();

      const trackList = data?.results?.trackmatches?.track || [];
      if (trackList.length === 0) break; // 더 이상 검색 결과 없음

      allTracks = allTracks.concat(trackList);
    }

    res.json({ tracks: allTracks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Last.fm API error" });
  }
});

app.listen(3010, () => {
  console.log("server start!");
});
