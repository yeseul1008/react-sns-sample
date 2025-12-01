import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, IconButton, Badge, Avatar } from "@mui/material";
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from "jwt-decode";

function Alert() {
  const [open, setOpen] = useState(false);
  const [chatList, setChat] = useState([]);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const myUserId = decoded?.userId;

  // 친구/채팅방 가져오기
  function fnGetFriend() {
    if (!myUserId) return;

    fetch("http://localhost:3010/chat/FriendList/" + myUserId)
      .then(res => res.json())
      .then(data => setChat(data.list))
      .catch(err => console.error(err));
  }

  useEffect(() => {
    fnGetFriend();
    // 이벤트 리스너 등록: 'refreshChatList' 이벤트 발생 시 fnGetFriend 호출
    const handleRefresh = () => fnGetFriend();
    window.addEventListener("refreshChatList", handleRefresh);

    return () => {
      window.removeEventListener("refreshChatList", handleRefresh);
    };
  }, []);

  const handleToggle = () => setOpen(!open);

  // 안읽음 Badge 계산 (내가 보낸 메시지는 제외)
  const unreadCount = chatList.filter(c =>
    (!c.LAST_MESSAGE_READ || c.LAST_MESSAGE_READ === 'N') &&
    c.LAST_MESSAGE_SENDER_ID !== myUserId
  ).length;

  return (
    <>
      {/* 채팅 버튼 */}
      <Box sx={{ position: "fixed", bottom: 100, right: 30, zIndex: 1500 }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box
            onClick={handleToggle}
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid #000",
              background: "linear-gradient(to bottom, #ffffff 0%, #97E646 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0px 5px 10px rgba(0,0,0,0.3)",
              "&:hover": {
                background: "linear-gradient(to bottom, #ffffff 0%, #b6f264 100%)",
              },
            }}
          >
            <ForumIcon sx={{ fontSize: 30, color: "#000" }} />
          </Box>
        </Badge>
      </Box>

      {/* 백드롭 */}
      {open && (
        <Box
          onClick={handleToggle}
          sx={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1400
          }}
        />
      )}

      {/* 채팅 리스트 패널 */}
      <Paper
        sx={{
          position: "fixed",
          top: 0, right: 0,
          width: 320,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          zIndex: 1501,
          boxShadow: "-5px 0px 15px rgba(0,0,0,0.3)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: "1px solid #ddd" }}>
          <Typography variant="h6">채팅</Typography>
          <IconButton onClick={handleToggle}><CloseIcon /></IconButton>
        </Box>

        {/* 채팅방 리스트 */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {chatList.length === 0 ? (
            <Typography sx={{ p: 2, color: "text.secondary" }}>채팅방이 없습니다.</Typography>
          ) : (
            chatList.map(room => {
              const isUnread = (!room.LAST_MESSAGE_READ || room.LAST_MESSAGE_READ === 'N') && room.LAST_MESSAGE_SENDER_ID !== myUserId;

              return (
                <Paper
                  key={room.ROOM_ID}
                  onClick={() => {
                    // 마지막 메시지 읽음 처리 요청
                    fetch("http://localhost:3010/chat/markAsRead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ roomId: room.ROOM_ID })
                    })
                      .then(res => res.json())
                      .then(() => {
                        // 상태 갱신
                        setChat(prev =>
                          prev.map(r =>
                            r.ROOM_ID === room.ROOM_ID
                              ? { ...r, LAST_MESSAGE_READ: 'Y' }
                              : r
                          )
                        );

                        // 채팅창 열기 이벤트
                        window.dispatchEvent(
                          new CustomEvent("openChat", {
                            detail: {
                              chatRoomId: room.ROOM_ID,
                              otherUserId: room.OTHER_USER_ID,
                              nickname: room.OTHER_NICKNAME,
                              profileImg: room.OTHER_PROFILE_IMG
                            }
                          })
                        );

                        // 패널 닫기
                        setOpen(false);
                      })
                      .catch(err => console.error(err));
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    m: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    backgroundColor: isUnread ? "#f5fff0" : "#fff",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  {/* 프로필 */}
                  <Avatar
                    src={room.OTHER_PROFILE_IMG ? `http://localhost:3010${room.OTHER_PROFILE_IMG}` : "/기본이미지.jpg"}
                    sx={{ width: 50, height: 50 }}
                  />

                  {/* 메시지 내용 */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{room.OTHER_NICKNAME}</Typography>
                    <Typography sx={{
                      fontSize: 14,
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {room.LAST_MESSAGE || "메시지가 없습니다."}
                    </Typography>
                  </Box>

                  {/* 시간 / 안읽음 표시 */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {room.LAST_MESSAGE_TIME ? new Date(room.LAST_MESSAGE_TIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </Typography>
                    {isUnread && (
                      <Box sx={{
                        width: 12, height: 12, borderRadius: "50%",
                        backgroundColor: "red", mt: 0.5
                      }} />
                    )}
                  </Box>
                </Paper>
              );
            })
          )}
        </Box>
      </Paper>
    </>
  );
}

export default Alert;
