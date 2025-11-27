import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";

export default function SearchPage() {
  const location = useLocation();
  const { query } = location.state || {};
  const [tracks, setTracks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 9;
  const pageGroupSize = 10; // ← 페이지 버튼 그룹 크기

  useEffect(() => {
    const fetchTracks = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3010/api/search?q=${query}`);
        const data = await res.json();
        const trackList = data?.tracks || [];
        setTimeout(() => {
          setTracks(trackList);
          setCurrentPage(1);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTracks();
  }, [query]);

  // 페이지별 데이터
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTracks = tracks.slice(indexOfFirst, indexOfLast);

  // 전체 페이지 계산
  const totalPages = Math.ceil(tracks.length / itemsPerPage);

  // 현재 페이지 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Search results for "{query}"
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: "#000000ff" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000000ff" }}>
            Searching for songs...
          </Typography>
        </Box>
      ) : (
        <>
          {/* 검색 결과 그리드 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 2,
              width: "100%",
              maxWidth: 1000,
              marginTop: 2,
            }}
          >
            {currentTracks.map((track, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  padding: 2,
                  background: "#ffffff",
                  border: "1px solid #000000",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Typography variant="h6">{track.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {track.artist}
                </Typography>
                {track.url && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={track.url}
                    target="_blank"
                    sx={{ marginTop: 1 }}
                  >
                    Listen
                  </Button>
                )}
              </Paper>
            ))}
          </Box>

          {/* 페이지네이션 */}
          <Box sx={{ marginTop: 4, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {/* 이전 그룹 버튼 */}
            {startPage > 1 && (
              <Button
                onClick={() => setCurrentPage(startPage - 1)}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: "50%",
                  fontWeight: "bold",
                  border: "1px solid #000000ff",
                }}
              >
                {"<"}
              </Button>
            )}

            {/* 페이지 번호 */}
            {pageNumbers.map((num) => (
              <Button
                key={num}
                onClick={() => setCurrentPage(num)}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: "50%",
                  fontWeight: "bold",
                  color: num === currentPage ? "#000000ff" : "#000000",
                  background: "linear-gradient(to bottom, #ffffff 0%, #FEFF66 100%)",
                  border: "1px solid #000000ff",
                  "&:hover": {
                    backgroundColor: num === currentPage ? "#FEFF66" : "#ffffffff",
                    borderColor: "#FEFF66",
                  },
                }}
              >
                {num}
              </Button>
            ))}

            {/* 다음 그룹 버튼 */}
            {endPage < totalPages && (
              <Button
                onClick={() => setCurrentPage(endPage + 1)}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: "50%",
                  fontWeight: "bold",
                  border: "1px solid #000000ff",
                }}
              >
                {">"}
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
