const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const multer = require('multer');
const db = require("../db");
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// 해시 함수 실행 위해 사용할 키로 아주 긴 랜덤한 문자를 사용하길 권장하며, 노출되면 안됨.
const JWT_KEY = "server_secret_key";


// 랜덤 게시글 가져오기
router.get("/random", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT p.POST_ID , p.USER_ID, u.PROFILE_IMG, p.LASTFM_TRACK_ID, p.CONTENT, p.IMAGE_URL, p.CREATED_AT, p.MUSIC_TITLE, p.SINGER FROM SNS_POST_TBL p JOIN SNS_USER_TBL u ON p.USER_ID = u.USER_ID ORDER BY RAND() LIMIT 1"
    );
    res.json({ post: rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 피드 한개 정보 불러오기
router.get("/detail/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT p.POST_ID, u.NICKNAME, p.USER_ID, u.PROFILE_IMG, p.LASTFM_TRACK_ID, p.CONTENT, p.IMAGE_URL, p.CREATED_AT, p.MUSIC_TITLE, p.SINGER " +
      "FROM SNS_POST_TBL p JOIN SNS_USER_TBL u ON p.USER_ID = u.USER_ID " +
      "WHERE p.POST_ID = ?",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      post: rows[0],
      result: "success"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 댓글 목록 불러오기
router.get("/comment/:postId", async (req, res) => {
  let { postId } = req.params;
  try {
    let sql = "SELECT * FROM SNS_COMMENT_TBL C LEFT JOIN SNS_USER_TBL U ON C.USER_ID = U.USER_ID WHERE POST_ID = ?";
    let [list] = await db.query(sql, [postId]);
    console.log(list);
    res.json({
      list: list,
      result: "success"
    })

  } catch (error) {
    console.log(error);
  }
})
// 프로필 정보 불러오기
router.get("/profile/:userId", async (req, res) => {
  let { userId } = req.params;
  try {
    let sql =
      "SELECT u.USER_ID, u.PASSWORD, u.EMAIL, u.NICKNAME, u.PROFILE_IMG, " +
      "       IFNULL(followers.follower_count, 0) AS followers, " +
      "       IFNULL(following.following_count, 0) AS following, " +
      "       IFNULL(posts.post_count, 0) AS posts " +
      "FROM SNS_USER_TBL u " +
      "LEFT JOIN ( " +
      "    SELECT FOLLOWING_ID, COUNT(*) AS follower_count " +
      "    FROM SNS_FOLLOW_TBL " +
      "    GROUP BY FOLLOWING_ID " +
      ") followers ON u.USER_ID = followers.FOLLOWING_ID " +
      "LEFT JOIN ( " +
      "    SELECT FOLLOWER_ID, COUNT(*) AS following_count " +
      "    FROM SNS_FOLLOW_TBL " +
      "    GROUP BY FOLLOWER_ID " +
      ") following ON u.USER_ID = following.FOLLOWER_ID " +
      "LEFT JOIN ( " +
      "    SELECT USER_ID, COUNT(*) AS post_count " +
      "    FROM SNS_POST_TBL " +
      "    GROUP BY USER_ID " +
      ") posts ON u.USER_ID = posts.USER_ID " +
      "WHERE u.USER_ID = ?"
      ;
    let [list] = await db.query(sql, [userId]);
    res.json({
      user: list[0],
      result: "success"
    })

  } catch (error) {
    console.log(error);
  }
})

// 피드 글 불러오기
router.get("/feedList/:userId", async (req, res) => {
  let { userId } = req.params;
  try {
    let sql = "SELECT * FROM SNS_POST_TBL WHERE USER_ID = ?";
    let [list] = await db.query(sql, [userId]);
    console.log(list);
    res.json({
      list: list,
      result: "success"
    })

  } catch (error) {
    console.log(error);
  }
})

// 내가 좋아요 한 글 불러오기
router.get("/likeList/:userId", async (req, res) => {
  // console.log(`${req.protocol}://${req.get("host")}`);
  let { userId } = req.params;
  try {
    let sql = "SELECT * FROM SNS_LIKE_TBL L LEFT JOIN SNS_POST_TBL P ON L.POST_ID = P.POST_ID WHERE L.USER_ID = ?";
    let [list] = await db.query(sql, [userId]);
    res.json({
      list,
      result: "좋아요리스트 success"
    })

  } catch (error) {
    console.log(error);
  }
})

// 피드 좋아요 누르기/삭제
router.post("/like", async (req, res) => {
  const { userId, postId, cancel } = req.body;

  try {
    if (cancel) {
      // 좋아요 취소: 삭제
      const sql = "DELETE FROM SNS_LIKE_TBL WHERE POST_ID = ? AND USER_ID = ?";
      await db.query(sql, [postId, userId]);
      return res.json({ result: true, message: "좋아요 취소 완료" });
    } else {
      // 좋아요 추가: 삽입
      const sql = "INSERT INTO SNS_LIKE_TBL (POST_ID, USER_ID, CREATED_AT) VALUES (?, ?, NOW())";
      await db.query(sql, [postId, userId]);
      return res.json({ result: true, message: "좋아요 완료" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "서버 오류" });
  }
});


// 좋아요 상태 확인
router.get("/isLiked", async (req, res) => {
  try {
    const { userId, postId } = req.query;
    const sql = `SELECT * FROM SNS_LIKE_TBL WHERE USER_ID = ? AND POST_ID = ?`;
    const [rows] = await db.execute(sql, [userId, postId]);

    // 있으면 true, 없으면 false
    const isLiked = rows.length > 0;

    res.json({ isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 댓글 추가
router.post("/comment", async (req, res) => {
    let { postId, userId, content } = req.body;
    console.log(req.body);
    try {
        let sql = "INSERT INTO SNS_COMMENT_TBL (POST_ID, USER_ID, COMMENT) VALUES (?, ?, ?)";
        let result = await db.query(sql, [postId, userId, content]);
        res.json({
            result: result,
            msg: "등록되었습니다."
        });
    } catch (error) {
        console.log(error);
    }
})

// 팔로우 하기
router.post("/follow", async (req, res) => {
    let { userId, followUserId } = req.body;
    try {
        let sql = "INSERT INTO SNS_FOLLOW_TBL(FOLLOWER_ID, FOLLOWING_ID, CREATED_AT) VALUES (?, ?, NOW())";
        let result = await db.query(sql, [userId, followUserId]);
        res.json({
            result: result,
            msg: "팔로우했습니다!"
        });
    } catch (error) {
        console.log(error);
    }
})
// 팔로우 삭제하기
router.post("/followDelete", async (req, res) => {
    let { userId, followUserId } = req.body;
    try {
        let sql = "DELETE FROM SNS_FOLLOW_TBL WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?";
        let result = await db.query(sql, [userId, followUserId]);
        res.json({
            result: result,
            msg: "팔로우 해제했습니다!"
        });
    } catch (error) {
        console.log(error);
    }
})
// 팔로우 상태 확인
router.post("/followCheck", async (req, res) => {
  try {
    const { userId, followUserId } = req.body;
    
    const sql = `SELECT * FROM SNS_FOLLOW_TBL WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?`;
    const [rows] = await db.execute(sql, [userId, followUserId]);

    // 있으면 true, 없으면 false
    const isFollow = rows.length > 0;
    res.json({ isFollow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});
//게시글 업로드
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 글 + 이미지 + 음악 정보 업로드
router.post('/uploadAll', upload.single('file'), async (req, res) => {
  try {
    const { userId, lastfmTrackId, content, title, singer } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ msg: "이미지를 선택해주세요" });
    if (!title || !singer || !lastfmTrackId) return res.status(400).json({ msg: "노래 정보를 선택해주세요" });

    // 이미지 URL 생성
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // DB insert
    const sql = `
      INSERT INTO SNS_POST_TBL(USER_ID, LASTFM_TRACK_ID, IMAGE_URL, CONTENT, MUSIC_TITLE, SINGER)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [userId, lastfmTrackId, imageUrl, content, title, singer]);

    res.json({ result: "success", postId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
});

// 프로필 수정
router.post("/profile/update", upload.single("profileImg"), async (req, res) => {
  try {
    const { userId, nickname, email } = req.body;

    // 이미지 URL 생성
    let profileImg = req.file ? `/uploads/${req.file.filename}` : null;

    let sql, params;
    if (profileImg) {
      sql = `UPDATE SNS_USER_TBL SET NICKNAME = ?, EMAIL = ?, PROFILE_IMG = ? WHERE USER_ID = ?`;
      params = [nickname, email, profileImg, userId];
    } else {
      sql = `UPDATE SNS_USER_TBL SET NICKNAME = ?, EMAIL = ? WHERE USER_ID = ?`;
      params = [nickname, email, userId];
    }

    await db.query(sql, params);

    res.json({ result: "success", profileImg });
  } catch (err) {
    console.log(err);
    res.json({ result: "fail", error: err });
  }
});



module.exports = router;