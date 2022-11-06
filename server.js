if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser') //--> added
const multer = require('multer')
const mongoose = require('mongoose')
const User = require('./models/user')
const Record = require('./models/record')

const mongoURI = 'mongodb://127.0.0.1:27017/i-attend'
mongoose.connect(mongoURI)

const initializePassport = require('./passport-config')
initializePassport(passport, email => User.findOne({ email }), user_id => User.findOne({ user_id }))

app.set('view-engine', 'ejs')

app.use(cookieParser('thisIsASecret')) //--> added
app.use(express.json()) //-->added
app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use(session({
	secret: 'thisIsASecret',
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, async(req, res) => {
	res.render('index.ejs', { user: req.user })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
	res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
	res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		const user = new User({
			user_id: Date.now().toString(),
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword
		})
		await user.save()
		res.redirect('/login')
	} catch {
		res.redirect('/register')
	}
})

app.delete('/logout', (req, res) => {
	req.logOut()
	res.redirect('/login')
})

app.get('/add-record', checkAuthenticated, (req, res) => {
	res.render('add-record.ejs', { user: req.user })
})

let file_const = ''
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads")
	},
	filename: function (req, file, cb) {
		const re = /(?:\.([^.]+))?$/
		const file_name = `${file_const}.${re.exec(file.originalname)[1]}`
		file_const = file_name
		cb(null, file_name)
	}
})

const upload = multer({ storage }).single('vid')

app.post('/upload-record', checkAuthenticated, function (req, res, next) {
	upload(req, res, async (err)=>{
		if(err){
			res.send(err)
		} else{
			const record = new Record({
				teacher_email: req.body['email'],
				date: req.body.date,
				start_time: req.body['start-time'],
				end_time: req.body['end-time'],
				year: req.body['year'],
				class: req.body['class'],
				subject: req.body['subject'],
				video_name: file_const,
			})
			await record.save()
			res.redirect('/')
		}
	})
})

app.get('/teacher-records', checkAuthenticated, async(req, res)=>{
	if(!req.query.email){
		res.send()
	} else{
		const records = await Record.find({ teacher_email: req.query.email })
		res.send(records)
	}
})

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}

	res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/')
	}
	next()
}

app.listen(3000, () => {
	console.log('server started at port 3000')
})