import React from "react";
import { Box, IconButton } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingMenu() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인

  // 각 버튼 정보
  const buttons = [
    { icon: "music.png", path: "/feed" },
    { icon: "like.png", path: "/likeList" },
    { icon: "friend.png", path: "/friend" },
    { icon: "mypage.png", path: "/mypage" },
    { icon: "option.png", path: "/option" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: "100px",
        left: "80px",
        display: "flex",
        flexDirection: "column",
        gap: 3.5,
        background: "linear-gradient(to bottom, #ffffff , #97E646)",
        borderRadius: "25px",
        padding: 4,
        border: "1px solid #000000",
        boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
      }}
    >
      {buttons.map((btn, index) => {
        // 현재 페이지 버튼인지 확인
        const isActive = location.pathname === btn.path;

        return (
          <IconButton
            key={index}
            sx={{
              border: "1px solid #000000",
              boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
              width: 100,
              height: 100,
              borderRadius: "50%",
              overflow: "hidden",
              padding: 0,
              transition: "transform 0.2s ease",
              transform: isActive ? "scale(1.1)" : "scale(1)",
              backgroundColor: isActive ? "#97E646" : "transparent", // 선택된 버튼 색상
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
            onClick={() => navigate(btn.path)}
          >
            <img
              src={`${process.env.PUBLIC_URL}/${btn.icon}`}
              alt={btn.path}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </IconButton>
        );
      })}
    </Box>
  );
}
