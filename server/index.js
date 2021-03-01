const express = require('express')
const app = express()
const port = 5000
const { User } = require('./model/user.js');
const bodyParser = require('body-parser');
const config = require('./config/key.js');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');


//application/x-www-form-urlencoded 분석해서 가져오는 코드
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 분석해서 가져오는 코드
app.use(bodyParser.json());

app.use(cookieParser());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('mongoDB connected...'))
  .catch((err) => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!!!!! 안녕!!')
})


app.post('/api/users/register', (req, res) => {

  //회원가입할때 필요한 정보들을 클라이언트에서 가져오면 그것들을 데이터베이스에 넣어준다
  const user = new User(req.body)



  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 DB에 있는지 확인.
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if (!userInfo) { return res.json({ loginSuccess: false, message: "email이 존재하지 않습니다." }) }

    //요청된 이메일이 DB에 있다면 비밀번호가 맞는지 비밀번호 인지 확인.
    userInfo.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

      //비밀번호가 같다면 token 생성
      userInfo.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰을 저장한다( where to? cookie? localStorage?)

        res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user_id })

      })
    })
  })
})

app.get("/api/users/auth", auth, (req, res) => {

  //여기까지 middleware를 통과했다는 말은 auth가 true 라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.roll === 0 ? false : true,
    // role 0 일반유저, role 1, 2, 3, 4 ... 어드민
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastName: req.user.lastName,
    role: req.user.role,
    image: req.user.image
  })

})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" },
    (err, user) => {
      if (err) return res.json({success: false, err});
      return res.status(200).send({ success: true })
    })
})

app.listen(port, () => { console.log(`Example app listening at http://localhost:${port}`) })