require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const configDB = require('./config/database');

// PHẢI đăng ký mongoose-long trước khi require các Model có Schema.Types.Long.
require('mongoose-long')(mongoose);

const User = require('./app/Models/Users');
const UserInfo = require('./app/Models/UserInfo');
const helpers = require('./app/Helpers/Helpers');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const BOT_PASSWORD = process.env.BOT_SEED_PASSWORD || '@demo12345';
const BOT_NAME_FILE = process.env.BOT_NAME_FILE || 'config/bot-username - Copy.json';

const models = {
    TaiXiu_User:     require('./app/Models/TaiXiu_user'),
    MiniPoker_User:  require('./app/Models/miniPoker/miniPoker_users'),
    Bigbabol_User:   require('./app/Models/BigBabol/BigBabol_users'),
    VQRed_User:      require('./app/Models/VuongQuocRed/VuongQuocRed_users'),
    BauCua_User:     require('./app/Models/BauCua/BauCua_user'),
    Mini3Cay_User:   require('./app/Models/Mini3Cay/Mini3Cay_user'),
    CaoThap_User:    require('./app/Models/CaoThap/CaoThap_user'),
    AngryBirds_user: require('./app/Models/AngryBirds/AngryBirds_user'),
    Candy_user:      require('./app/Models/Candy/Candy_user'),
    LongLan_user:    require('./app/Models/LongLan/LongLan_user'),
    XocXoc_user:     require('./app/Models/XocXoc/XocXoc_user'),
    MegaJP_user:     require('./app/Models/MegaJP/MegaJP_user')
};

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function loadBotNames() {
    const file = path.resolve(BOT_NAME_FILE);

    if (!fs.existsSync(file)) {
        throw new Error('Không tìm thấy file tên bot: ' + file);
    }

    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const az09 = /^[a-zA-Z0-9]+$/;

    const names = [];
    for (const key in raw) {
        const value = String(raw[key] || '').trim();

        if (az09.test(value) && value.length <= 14) {
            names.push(value);
        }
    }

    return [...new Set(names)];
}

async function ensureGameProfile(Model, uid, label) {
    try {
        const exists = await Model.findOne({ uid: uid }).select('_id').lean().exec();
        if (!exists) {
            await Model.create({ uid: uid });
            console.log('  + profile:', label);
        }
    } catch (err) {
        console.error('  ! profile lỗi', label + ':', err.message || err);
    }
}

async function ensureUserInfo(uid, name, joinedOn) {
    let info = await UserInfo.findOne({ name: name }).exec();

    if (!info) {
        info = await UserInfo.create({
            id: uid,
            name: name,
            joinedOn: joinedOn,
            type: true
        });
        console.log('  + UserInfo:', name);
    } else {
        // Đảm bảo user bot luôn được đánh dấu type:true.
        let changed = false;

        if (String(info.id) !== String(uid)) {
            info.id = uid;
            changed = true;
        }
        if (info.type !== true) {
            info.type = true;
            changed = true;
        }

        if (changed) {
            await info.save();
        }
    }

    await Promise.all(
        Object.entries(models).map(([label, Model]) =>
            ensureGameProfile(Model, uid, label)
        )
    );
}

async function ensureBot(name) {
    const username = name + '_bot';

    let user = await User.findOne({ 'local.username': username }).exec();

    if (!user) {
        const regDate = randomDate(new Date(2021, 0, 1), new Date());

        user = await User.create({
            local: {
                username: username,
                password: helpers.generateHash(BOT_PASSWORD),
                regDate: regDate
            }
        });

        console.log('+ CREATED:', username);
    } else {
        console.log('= EXISTS :', username);
    }

    const uid = user._id;
    const joinedOn =
        user.local && user.local.regDate
            ? user.local.regDate
            : new Date();

    await ensureUserInfo(uid, name, joinedOn);
}

async function main() {
    const options = Object.assign({}, configDB.options || {}, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000
    });

    mongoose.connection.on('error', function (err) {
        console.error('[MongoDB] error:', err.message || err);
    });

    console.log('[MongoDB] Connecting...');
    await mongoose.connect(configDB.url, options);
    console.log('[MongoDB] Connected');

    const names = loadBotNames();

    console.log('Bot hợp lệ:', names.length);

    let ok = 0;
    let failed = 0;

    // Chạy tuần tự để tránh tạo quá nhiều query cùng lúc trên Atlas free tier.
    for (const name of names) {
        try {
            await ensureBot(name);
            ok++;
        } catch (err) {
            failed++;
            console.error('! BOT ERROR:', name, '-', err.message || err);
        }
    }

    console.log('');
    console.log('===== HOÀN TẤT =====');
    console.log('Thành công:', ok);
    console.log('Lỗi:', failed);
    console.log('Tổng:', names.length);

    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected');
}

main()
    .then(function () {
        process.exit(0);
    })
    .catch(async function (err) {
        console.error('[FATAL]', err.message || err);

        try {
            await mongoose.disconnect();
        } catch (_) {}

        process.exit(1);
    });
