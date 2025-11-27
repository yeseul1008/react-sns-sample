import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, TextField, Button } from '@mui/material';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function UserEdit() {
  const [user, setUser] = useState();
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    userId: '',
    password: '',
    email: ''
  });
  const navigate = useNavigate();

  function fnGetUser() {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);

      fetch("http://localhost:3010/feed/profile/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          setFormData({
            nickname: data.user.NICKNAME || '',
            userId: data.user.USER_ID || '',
            password: data.user.PASSWORD || '',
            profileImg: data.user.PROFILE_IMG || '',
            email: data.user.EMAIL || ''
          });
          setPreview(data.user.PROFILE_IMG ? `http://localhost:3010${data.user.PROFILE_IMG}` : null);
        });
    } else {
      alert("로그인 후 이용해주세요.");
      navigate("/");
    }
  }

  useEffect(() => {
    fnGetUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, profileImg: file })); // 선택한 파일 저장

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result); // base64 문자열로 미리보기
    };
    reader.readAsDataURL(file);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 수정하기
  const fnUpdateUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/");
      return;
    }

    const decoded = jwtDecode(token);

    const form = new FormData();
    form.append("userId", decoded.userId);
    form.append("nickname", formData.nickname);
    form.append("email", formData.email);

    // 이미지 선택한 경우만 append
    const fileInput = document.querySelector("#profileImgInput");
    if (fileInput && fileInput.files[0]) {
      form.append("profileImg", fileInput.files[0]); // name이 profileImg와 같아야 함
    }


    fetch("http://localhost:3010/feed/profile/update", {
      method: "POST",
      body: form,
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === "success") {
          alert("프로필이 수정되었습니다!");
          fnGetUser(); // 다시 프로필 불러오기
          navigate("/myPage");
        } else {
          alert("수정 중 오류가 발생했습니다.");
        }
      });
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ padding: '40px 20px' }}>
        <Paper
          elevation={3}
          sx={{
            marginTop: 6,
            marginBottom: 2,
            width: '100%',
            height: 600,
            aspectRatio: '1334/594',
            borderRadius: '15px',
            border: "1px solid #000000",
            boxShadow: "0px 3px 3px rgba(0, 0, 0, 0.81)",
            padding: '40px',
            display: 'flex',
            gap: 4,
            backgroundImage: "url('/profile.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            alignItems: 'center',
          }}
        >
          {/* 왼쪽: 이미지 미리보기 */}
          <Box
            sx={{
              width: 325,
              height: 325,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px dashed #ccc',
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.7)', // 이미지 영역 살짝 밝게
              padding: 2,
              overflow: 'hidden',          // 이미지 잘림 허용
              aspectRatio: '1 / 1',        // 정사각형 유지
            }}
          >
            {preview ? (
              <img src={preview} alt="미리보기" style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover', }} />
            ) : (
              <span>이미지 미리보기</span>
            )}
          </Box>

          {/* 오른쪽: 입력폼 */}
          <Box
            sx={{
              width: '60%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 2
            }}
          >
            {/* 이미지 첨부 버튼 */}
            <Button variant="contained" component="label" sx={{
              
              backgroundColor: 'transparent',
              border: '2px solid #000',
              borderRadius: '50px',
              boxShadow: 'none',
              background: "linear-gradient(to bottom, #ffffff 0%, #97E646 100%)",
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 600,
              color: '#000',
              // padding: '12px 0',
              '&:hover': {
                background: "linear-gradient(to bottom, #ffffff 0%, #b6f264 100%)",
                boxShadow: 'none',
              },
            }}>
              이미지 선택
              <input
                id="profileImgInput"
                type="file"
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
            </Button>


            {/* 닉네임 */}
            <TextField
              label="Nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              fullWidth
            />
            {/* 아이디 */}
            <TextField
              label="User ID"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              fullWidth
              disabled
            />
            {/* 비밀번호 */}
            <TextField
              label="Password"
              name="password"
              value="비밀번호 변경은 ‘비밀번호 찾기’에서 가능합니다."
              fullWidth
              InputProps={{
                readOnly: true
              }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#808080ff', // 글자색 적용
                }
              }}
              disabled
            />

            {/* 이메일 */}
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </Paper>

        {/* Paper 아래 등록 버튼 */}
        <Button
          variant="contained"
          sx={{
            mt: 2,
            width: '200px',     // ← 여기!
            backgroundColor: 'transparent',
            border: '2px solid #000',
            borderRadius: '50px',
            boxShadow: 'none',
            background: "linear-gradient(to bottom, #ffffff 0%, #97E646 100%)",
            textTransform: 'none',
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            padding: '12px 0',
            '&:hover': {
              background: "linear-gradient(to bottom, #ffffff 0%, #b6f264 100%)",
              boxShadow: 'none',
            },
          }}
          onClick={fnUpdateUser}
        >
          REGISTER
        </Button>
      </Box>
    </Container>
  );
}

export default UserEdit;
