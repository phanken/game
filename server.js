require('dotenv').config();

var cors = require('cors');
let Telegram      = require('node-telegram-bot-api');
let TelegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
let TelegramBot;

if (TelegramToken) {
    TelegramBot = new Telegram(TelegramToken, {polling: true});
} else {
    console.warn('[WARN] TELEGRAM_BOT_TOKEN is not set. Telegram features are disabled.');
    TelegramBot = {
        on: function(){},
        sendMessage: function(){ return Promise.reject(new Error('Telegram bot is disabled')); }
    };
}

let fs = require('fs');

let express = require('express');
let app = express();

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

let port       = process.env.PORT || 80;
let expressWs  = require('express-ws')(app);
let bodyParser = require('body-parser');
let morgan     = require('morgan');

// =========================
// MongoDB / Mongoose
// =========================
let configDB = require('./config/database');
let mongoose = require('mongoose');
require('mongoose-long')(mongoose);

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Gộp option cũ với các option ổn định hơn cho MongoDB Atlas.
let mongoOptions = Object.assign({}, configDB.options || {}, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000
});

let backendStarted = false;

function startBackendOnce() {
    if (backendStarted) return;
    backendStarted = true;

    console.log('[INIT] Starting game backend...');

    // cấu hình tài khoản admin mặc định và các dữ liệu mặc định
    require('./config/admin');

    // server socket
    let redT = expressWs.getWss();
    process.redT = redT;
    redT.telegram = TelegramBot;

    global['redT'] = redT;
    global['userOnline'] = 0;

    require('./app/Helpers/socketUser')(redT);
    require('./routerHttp')(app, redT);
    require('./routerCMS')(app, redT);
    require('./routerSocket')(app, redT);

    // Chỉ chạy game/cron sau khi MongoDB đã kết nối.
    require('./app/Cron/taixiu')(redT);
    require('./app/Cron/baucua')(redT);
    require('./config/cron')();
    require('./app/Telegram/Telegram')(redT);
    require('./config/cronchattx')(redT);

    console.log('[INIT] Game backend started.');
}

function connectMongo() {
    console.log('[MongoDB] Connecting...');

    mongoose.connect(configDB.url, mongoOptions)
        .then(function() {
            console.log('MongoDB connected');
            startBackendOnce();
        })
        .catch(function(err) {
            console.error('[MongoDB] Initial connection failed:', err.message || err);

            // Không để process chết; thử lại sau 5 giây.
            setTimeout(function() {
                if (mongoose.connection.readyState === 0) {
                    connectMongo();
                }
            }, 5000);
        });
}

// Quan trọng: bắt error event để MongoNetworkError không trở thành unhandled event.
mongoose.connection.on('error', function(err) {
    console.error('[MongoDB] connection error:', err.message || err);
});

mongoose.connection.on('disconnected', function() {
    console.warn('[MongoDB] disconnected - waiting for driver to reconnect...');

    // Unified topology thường tự reconnect.
    // Nếu connection chuyển hẳn về disconnected (0) lâu hơn, connect lại.
    setTimeout(function() {
        if (mongoose.connection.readyState === 0) {
            connectMongo();
        }
    }, 5000);
});

mongoose.connection.on('reconnected', function() {
    console.log('[MongoDB] reconnected');
});

// =========================
// Express
// =========================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('combined'));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Mở HTTP server ngay để Render health check không bị timeout.
// Các route/game phụ thuộc DB sẽ được gắn sau khi MongoDB connected.
app.listen(port, function() {
    console.log('Server listen on port ', port);
});

// Bắt đầu kết nối DB cuối cùng.
connectMongo();
