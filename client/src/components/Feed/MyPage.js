import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper, ImageList, ImageListItem } from '@mui/material';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function MyPage() {
    const [user, setUser] = useState();
    const [feedList, setFeedList] = useState([]);
    const navigate = useNavigate();

    function fnGetUser() {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            fetch("http://localhost:3010/feed/profile/" + decoded.userId)
                .then(res => res.json())
                .then(data => {
                    setUser({
                        USER_ID: data.user.USER_ID || '',
                        NICKNAME: data.user.NICKNAME || '',
                        EMAIL: data.user.EMAIL || '',
                        PASSWORD: data.user.PASSWORD || '',
                        followers: data.user.followers || 0,
                        following: data.user.following || 0,
                        posts: data.user.posts || 0,
                        PROFILE_IMG: data.user.PROFILE_IMG
                            ? `http://localhost:3010${data.user.PROFILE_IMG}`
                            : null
                    });
                });
        } else {
            alert("로그인 후 이용해주세요.");
            navigate("/");
        }
    }

    function fnGetUserFeed() {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            fetch("http://localhost:3010/feed/feedList/" + decoded.userId)
                .then(res => res.json())
                .then(data => {
                    console.log(data.list);
                    setFeedList(data.list); // feedList에 저장
                });
        } else {
            alert("로그인 후 이용해주세요.");
            navigate("/");
        }
    }

    useEffect(() => {
        fnGetUser();
        fnGetUserFeed();
    }, [])

    return (
        <Container maxWidth="md">
            <Box            
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                minHeight="100vh"
                sx={{ padding: '20px', marginTop: 7 }}
            >
                <Paper elevation={3} sx={{
                    padding: '20px', borderRadius: '15px', width: '100%', border: "1px solid #000000",
                    boxShadow: "0px 3px 3px rgba(0, 0, 0, 0.81)"
                }}>
                    {/* 프로필 정보 상단 배치 */}
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
                        <Avatar
                            alt="프로필 이미지"
                            src={user?.PROFILE_IMG}
                            sx={{ width: 100, height: 100, marginBottom: 2 }}
                        />
                        <Typography variant="h5">{user?.NICKNAME}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            @{user?.USER_ID}
                        </Typography>

                        <Box sx={{ marginTop: 1, display: "flex", gap: 2 }}>
                            <button
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #000000",
                                    background: "linear-gradient(to bottom, #ffffff 0%, #FEFF66 100%)",
                                    color: "#000000",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                                onClick={() => navigate("/Register")}
                            >
                                게시글 추가
                            </button>

                            <button
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #000000",
                                    background: "linear-gradient(to bottom, #ffffff 0%, #FEFF66 100%)",
                                    color: "#000000",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                                onClick={() => navigate("/UserEdit")}
                            >
                                프로필 수정
                            </button>
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={4} textAlign="center">
                            <Typography variant="h6">팔로워</Typography>
                            <Typography variant="body1">{user?.followers}</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                            <Typography variant="h6">팔로잉</Typography>
                            <Typography variant="body1">{user?.following}</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                            <Typography variant="h6">게시물</Typography>
                            <Typography variant="body1">{user?.posts}</Typography>
                        </Grid>
                    </Grid>

                    {/* 게시글 이미지 출력 */}
                    <Box sx={{ marginTop: 4 }}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>내 게시글</Typography>
                        <ImageList variant="standard" cols={3} gap={8}>
                            {feedList.map((feed) => (
                                feed.IMAGE_URL && (
                                    <ImageListItem key={feed.POST_ID} sx={{ width: '100%', aspectRatio: '1 / 1' }}>
                                        <img
                                            src={feed.IMAGE_URL}
                                            alt={feed.CONTENT || 'feed image'}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover', // 사진 비율 유지하면서 중앙 기준으로 잘림
                                                borderRadius: '8px',
                                                display: 'block'
                                            }}
                                        />
                                    </ImageListItem>
                                )
                            ))}
                        </ImageList>
                    </Box>


                </Paper>
            </Box>
        </Container>
    );
}

export default MyPage;
