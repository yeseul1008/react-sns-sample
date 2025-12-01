import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { jwtDecode } from "jwt-decode";

function ChatPopup({ chatRoomId, otherUserId, otherUserNickname, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // 드래그 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  // 최초 위치: 오른쪽 화면 중앙
  useEffect(() => {
    const chatWidth = 350;
    const chatHeight = 440;
    const rightMargin = 80;
    const initialX = window.innerWidth - chatWidth - rightMargin;
    const initialY = (window.innerHeight - chatHeight) / 2;
    setPosition({ x: initialX, y: initialY });
  }, []);

  // 메시지 가져오기
  function fnGetMessages() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const loggedInUserId = jwtDecode(token).userId;

    fetch("http://localhost:3010/chat/getMessages/" + chatRoomId)
      .then(res => res.json())
      .then(data => {
        const formattedMessages = data.list.map(msg => ({
          sender: msg.SENDER_ID === loggedInUserId ? 'me' : 'other',
          text: msg.MESSAGE,
          timestamp: msg.CREATED_AT
        }));
        setMessages(formattedMessages);
      });
  }

  useEffect(() => {
    fnGetMessages();
  }, []);

  // 로그아웃 시 채팅창 닫기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      onClose();
    }
  }, [onClose]);

  // 엔터 키로 전송
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!input) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    fetch("http://localhost:3010/chat/sendChat", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        chatRoomId,
        senderId: decoded.userId,
        message: input
      })
    })
      .then(res => res.json())
      .then(() => {
        setMessages(prev => [...prev, { sender: 'me', text: input, timestamp: new Date() }]);
        setInput('');

        // Alert.js에 채팅 리스트 갱신 이벤트 발생
        window.dispatchEvent(new Event("refreshChatList"));
      });
  };

  // 드래그 이벤트
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setRel({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!dragging) return;

    const chatWidth = 350;
    const chatHeight = 440;
    const maxX = window.innerWidth - chatWidth;
    const maxY = window.innerHeight - chatHeight;

    let newX = e.clientX - rel.x;
    let newY = e.clientY - rel.y;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > maxX) newX = maxX;
    if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed', width: 350, height: 440,
        display: 'flex', flexDirection: 'column', borderRadius: 3,
        top: position.y, left: position.x,
        cursor: dragging ? 'grabbing' : 'grab',
        overflow: 'hidden',
        border: "1px solid #000000",
        boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
      }}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp}
    >
      {/* 상단 헤더 */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #ddd', backgroundColor: '#FEFF66' }}
        onMouseDown={onMouseDown}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginLeft: 1 }}>{otherUserNickname}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* 메시지 영역 */}
      <Box sx={{ flex: 1, p: 1, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              flexDirection: msg.sender === 'me' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              mb: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{
                border: "1px solid #000000",
                display: 'inline-block',
                p: 1,
                borderRadius: 50,
                background: msg.sender === 'me'
                  ? 'linear-gradient(to bottom, #FFFFFF 10%, #97E646 90%)'
                  : '#ffffffff',
                maxWidth: '70%',
                wordBreak: 'break-word',
                fontSize: '0.85rem',
              }}
            >
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                ml: msg.sender === 'me' ? 1 : 0,
                mr: msg.sender === 'me' ? 0 : 1,
                color: '#999',
                fontSize: '0.65rem',
                marginLeft: '5px',
                marginRight: '5px',
                textAlign: 'center',
              }}
            >
              {msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 입력 영역 */}
      <Box sx={{ display: 'flex', p: 1, borderTop: '1px solid #ddd' }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 입력..."
        />
        <IconButton sx={{ ml: 1, backgroundColor: '#97E646', '&:hover': { backgroundColor: '#8ED034' }, border: "1px solid #000000" }} onClick={sendMessage}>
          <SendIcon sx={{ color: '#fff' }} />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default ChatPopup;
