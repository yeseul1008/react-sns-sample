import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper, ImageList, ImageListItem, Button } from '@mui/material';
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

function OtherUser() {
    const location = useLocation();
    const [user, setUser] = useState();
    const { userId } = location.state || {}; // MusicCard에서 보낸 userId
    const [feedList, setFeedList] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false); // 팔로우 상태
    const navigate = useNavigate();

    // 로그인한 유저 ID
    const token = localStorage.getItem("token");
    const loggedInUserId = token ? jwtDecode(token).userId : null;

    function fnGetUser() {
        if (!token) {
            alert("로그인 후 이용해주세요.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/feed/profile/" + userId)
            .then(res => res.json())
            .then(data => {
                setUser({
                    USER_ID: data.user.USER_ID || '',
                    NICKNAME: data.user.NICKNAME || '',
                    EMAIL: data.user.EMAIL || '',
                    followers: data.user.followers || 0,
                    following: data.user.following || 0,
                    posts: data.user.posts || 0,
                    PROFILE_IMG: data.user.PROFILE_IMG
                        ? `http://localhost:3010${data.user.PROFILE_IMG}`
                        : null
                });
                setIsFollowing(data.user.isFollowing || false); // 팔로우 상태 초기값
            });
    }

    function fnGetUserFeed() {
        if (!token) {
            alert("로그인 후 이용해주세요.");
            navigate("/");
            return;
        }

        fetch("http://localhost:3010/feed/feedList/" + userId)
            .then(res => res.json())
            .then(data => setFeedList(data.list));
    }

    // 팔로우 여부 체크
    function fnfollowCheck() {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        let param = {
            userId: decoded.userId,
            followUserId: userId
        };

        fetch("http://localhost:3010/feed/followCheck", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(param)
        })
            .then(res => res.json())
            .then(data => {
                console.log("팔로우상태==>", data.isFollow);
                setIsFollowing(data.isFollow);
            })
    }

    useEffect(() => {
        fnGetUser();
        fnGetUserFeed();
        fnfollowCheck();
    }, []);

    return (
        <Container maxWidth="md">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" minHeight="100vh" sx={{ padding: '20px', marginTop: 7 }}>
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%', border: "1px solid #000000", boxShadow: "0px 3px 3px rgba(0, 0, 0, 0.81)" }}>

                    {/* 프로필 정보 */}
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
                        <Avatar alt="프로필 이미지" src={user?.PROFILE_IMG} sx={{ width: 100, height: 100, marginBottom: 2 }} />
                        <Typography variant="h5">{user?.NICKNAME}</Typography>
                        <Typography variant="body2" color="text.secondary">@{user?.USER_ID}</Typography>

                        {/* 팔로우 버튼 (본인 계정이면 안보임) */}
                        {userId !== loggedInUserId && (
                            <Button
                                variant={isFollowing ? "outlined" : "contained"}
                                color="primary"
                                sx={{
                                    mt: 2,
                                    width: '150px',
                                    borderRadius: '50px',
                                    textTransform: 'none',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                }}
                                onClick={() => {
                                    if (!isFollowing) { // 팔로잉 되있지 않은 경우 (인서트)
                                        const token = localStorage.getItem("token");
                                        const decoded = jwtDecode(token);
                                        let param = {
                                            userId: decoded.userId,
                                            followUserId: userId
                                        };
                                        console.log(param);

                                        fetch("http://localhost:3010/feed/follow", {
                                            method: "POST",
                                            headers: {
                                                "Content-type": "application/json"
                                            },
                                            body: JSON.stringify(param)
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                console.log(data);
                                                alert(data.msg);
                                                setIsFollowing(true);
                                            })
                                    } else { // 팔로잉 되있는 경우 (딜리트)
                                        const token = localStorage.getItem("token");
                                        const decoded = jwtDecode(token);
                                        let param = {
                                            userId: decoded.userId,
                                            followUserId: userId
                                        };
                                        console.log(param);

                                        fetch("http://localhost:3010/feed/followDelete", {
                                            method: "POST",
                                            headers: {
                                                "Content-type": "application/json"
                                            },
                                            body: JSON.stringify(param)
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                console.log(data);
                                                alert(data.msg);
                                                setIsFollowing(false);
                                            })
                                    }
                                }}
                            >
                                {isFollowing ? "following" : "follow"}
                            </Button>
                        )}
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

                    {/* 게시글 이미지 */}
                    <Box sx={{ marginTop: 4 }}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>내 게시글</Typography>
                        <ImageList variant="standard" cols={3} gap={8}>
                            {feedList.map(feed => feed.IMAGE_URL && (
                                <ImageListItem key={feed.POST_ID} sx={{ width: '100%', aspectRatio: '1 / 1' }}>
                                    <img
                                        src={feed.IMAGE_URL}
                                        alt={feed.CONTENT || 'feed image'}
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default OtherUser;
