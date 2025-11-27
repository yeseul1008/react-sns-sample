import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography, Card, Button } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


export default function MusicCard() {
  const [post, setPost] = useState(null);
  const [postId, setPostId] = useState(null);// 현재 포스트 아이디 저장
  const [otheruserId, setUserId] = useState(null);// 현재 포스트의 유저 아이디 저장
  const [liked, setLiked] = useState(false); // 좋아요 여부
  const navigate = useNavigate();

  const goToFeedDetail = () => {
    navigate("/feedDetail", { state: { postId: postId } });
  };

  const goToOtherUser = () => {
    navigate("/otherUser", { state: { userId: otheruserId } });
  };
  const formatDate = (dateString) => {
    if (!dateString) return "...";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd} / ${hh}:${min}`;
  };

  const fetchRandomPost = async () => {
    try {
      const res = await fetch("http://localhost:3010/feed/random");
      const data = await res.json();
      setPost(data.post);
      setPostId(data.post.POST_ID);
      setUserId(data.post.USER_ID);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRandomPost();
  }, []);

  //좋아요 여부 확인 
  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      const res = await fetch(`http://localhost:3010/feed/isLiked?userId=${userId}&postId=${postId}`);
      const data = await res.json();

      if (res.ok) {
        setLiked(data.isLiked); // DB에서 받아온 좋아요 상태 반영
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { // 포스트가 바뀔때마다 좋아요 여부확인
    if (postId) {
      checkLikeStatus();
    }
  }, [postId]);

  // 좋아요 버튼 클릭 시 호출할 함수
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인 후 이용해주세요.");
        return;
      }
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      const res = await fetch("http://localhost:3010/feed/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          postId,
          cancel: liked // liked가 true면 취소 요청
        })
      });

      const data = await res.json();
      if (res.ok) {
        setLiked(!liked); // 상태 토글
        alert(liked ? "좋아요 취소 완료!" : "좋아요 완료!");
      } else {
        alert("좋아요 실패: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("오류 발생");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        gap: 4,
      }}
    >
      {/* 왼쪽 화살표 */}
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: "50%", // 원 모양
          overflow: "hidden",
          boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
          cursor: "pointer",
          marginRight: 5,
          transition: "transform 0.2s ease", // 부드러운 애니메이션 추가
          "&:hover": {
            transform: "scale(1.06)", // 마우스 올리면 10% 확대
          },
          "&:active": {
            transform: "scale(0.9)", // 클릭 시 10% 축소
          },
        }}
        onClick={fetchRandomPost}
      >
        <Box
          component="img"
          src="/Left.png"
          alt="왼쪽 화살표"
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* 카드 */}
      <Card
        sx={{
          marginTop: 12,
          width: 500,
          height: 700,
          borderRadius: 7,
          padding: 3,
          paddingLeft: 5,
          paddingRight: 5,
          border: "1px solid #000000",
          boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* 카드 상단: 앨범 아이콘 + 노래 제목/가수 + 날짜 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="/ummban.png"
              alt="앨범 이미지"
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                cursor: "pointer",
                transition: "transform 0.5s ease", // 부드러운 회전
                "&:hover": {
                  transform: "rotate(360deg)", // 마우스 올리면 1회전
                },
              }}
              onClick={() => {
                if (post?.LASTFM_TRACK_ID) {
                  window.open(post.LASTFM_TRACK_ID, "_blank");
                }
              }}
            />
            <Box>
              <Typography fontWeight="bold" fontSize={20}>{post?.MUSIC_TITLE || "노래 제목"}</Typography>
              <Typography fontWeight="bold" fontSize={14} >{post?.SINGER || "가수 이름"}</Typography>
            </Box>
          </Box>

        </Box>

        {/* 카드 이미지 */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 2,
            overflow: "hidden", // object-fit crop 위해
            backgroundColor: "#f5f5f5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {post?.IMAGE_URL && post.IMAGE_URL.toLowerCase().endsWith(".gif") ? (
            <img
              src={encodeURI(post.IMAGE_URL)}
              alt={post.CONTENT || "feed image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${encodeURI(post?.IMAGE_URL)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
        </Box>


        {/* 게시글 내용 */}
        <Typography fontSize={12}>{formatDate(post?.CREATED_AT)}</Typography>
        <Typography sx={{ mb: 2 }}>{post?.CONTENT}</Typography>

        {/* 카드 하단 아이콘 */}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {/* 좋아요 이미지 */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              outline: "none",
            }}
            onClick={handleLike}
          >
            <img
              src={liked ? "/afterLike.png" : "/Good.png"}
              alt="좋아요"
              style={{
                width: 55, // liked 이미지 조금 키움
                height: "auto",
                marginLeft: 10,
                marginBottom: 2,
                transition: "transform 0.2s ease", // 애니메이션
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"} // 클릭
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1)"}   // 클릭 후 복귀
            />
          </button>


          <Box
            sx={{
              width: 87, // 외부 검정 테두리 포함
              height: 87,
              borderRadius: "50%",
              backgroundColor: "black", // 외부 테두리
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
             transition: "transform 0.2s ease", // 애니메이션
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"} // 클릭
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1)"}   // 클릭 후 복귀
          >
            <IconButton
              sx={{
                width: 83,
                height: 83,
                borderRadius: "50%",
                padding: "3px", // 투톤 테두리 두께
                background: "linear-gradient(to top, #97E646, #ffffff)", // 투톤 테두리
                overflow: "hidden",
              }}
              onClick={goToOtherUser}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff", // 내부 배경
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={post?.PROFILE_IMG ? `http://localhost:3010${post.PROFILE_IMG}` : "/circle-icon.png"}
                  alt="유저 프로필"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </IconButton>
          </Box>


          {/* 댓글 이미지 */}
          <button style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={goToFeedDetail}>
            <img
              src="/comment.png"
              alt="댓글"
              style={{
                width: 65, height: "auto", marginRight: 10, transition: "transform 0.2s ease", // 애니메이션
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"} // 클릭
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1)"}   // 클릭 후 복귀
            />
          </button>
        </div>

      </Card>
      {/* 오른쪽 화살표 */}
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0px 5px 3px rgba(0, 0, 0, 0.81)",
          cursor: "pointer",
          marginLeft: 5,
          transition: "transform 0.2s ease", // 부드러운 애니메이션 추가
          "&:hover": {
            transform: "scale(1.)", // 마우스 올리면 10% 확대
          },
          "&:active": {
            transform: "scale(0.9)", // 클릭 시 10% 축소
          },
        }}
        onClick={fetchRandomPost}
      >
        <Box
          component="img"
          src="/Right.png"
          alt="오른쪽 화살표"
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
}
