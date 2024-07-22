const User = require('../models/User');
const Follow = require('../models/Follow');
const Article = require('../models/Article');

// 프로필 디테일
exports.details = async (req, res, next) => {
  try {

    // 프로필을 표시할 유저 검색
    const user = await User
      .findOne({ username: req.params.username });

    // 유저가 존재하지 않을 때
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // 프로필 유저와의 팔로우 관계, 
    // 프로필 유저의 팔로워/팔로잉 수
    // 프로필 유저의 게시물 수 검색

    const follow = await Follow
      .findOne({ follower: req.user._id, following: user._id })
    const followingCount = await Follow.count({ follower: user._id })
    const followerCount = await Follow.count({ following: user._id })
    const articleCount = await Article.count({ author: user._id })

    // 프로필 데이터
    const profile = {
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      image: user.image,
      isFollowing: !!follow,
      followerCount,
      followingCount,
      articleCount
    }

    res.json({ profile });

  } catch (error) {
    next(error)
  }
}

// 팔로우
exports.follow = async (req, res, next) => {
  try {

    // 팔로우할 유저를 검색한다
    const user = await User.findOne({ username: req.params.username });

    // 이미 팔로우 중일 경우
    const _follow = await Follow
      .findOne({ follower: req.user._id, following: user._id })

    if (_follow) {
      const err = new Error("You are following this user already.");
      err.status = 400;
      throw err;
    }

    // 팔로우 처리
    const follow = new Follow({
      follower: req.user._id,
      following: user._id
    })

    await follow.save();

    res.json({ follow });

  } catch (error) {
    next(error)
  }
}


// 팔로우 취소
exports.unfollow = async (req, res, next) => {
  try {

    // 팔로우 취소할 유저 검색
    const user = await User.findOne({ username: req.params.username });

    // 팔로우하고 있는 유저가 아닐 경우
    const follow = await Follow
      .findOne({ follower: req.user._id, following: user._id });

    if (!follow) {
      const err = new Error("You are not following this user.");
      err.status = 400;
      throw err;
    }

    await follow.delete();

    res.json({ follow });

  } catch (error) {
    next(error)
  }
}