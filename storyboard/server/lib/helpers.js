'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkToken = exports.generateToken = exports.sendError = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _env = require('./env');

var _encUtf = require('crypto-js/enc-utf8');

var _encUtf2 = _interopRequireDefault(_encUtf);

var _users = require('./schemas/users');

var _aes = require('crypto-js/aes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OFFSET = 1000 * 60 * 60 * 24; // a day

var sendError = exports.sendError = function sendError(error) {
    return { error: error };
};

var generateToken = exports.generateToken = function generateToken(email) {
    return (0, _aes.encrypt)(email + '|' + (new Date().valueOf() + OFFSET), _env.CYPHER).toString();
};

var checkToken = exports.checkToken = async function checkToken(req, res, next) {
    var token = req.body.token;


    if (token) {
        var _decrypt$toString$spl = (0, _aes.decrypt)(token, _env.CYPHER).toString(_encUtf2.default).split('|'),
            _decrypt$toString$spl2 = _slicedToArray(_decrypt$toString$spl, 2),
            email = _decrypt$toString$spl2[0],
            expDate = _decrypt$toString$spl2[1];

        if (expDate <= new Date().valueOf()) {
            res.json(sendError('token_expired'));
        } else {
            var user = await _users.User.findOne({ email: email });
            if (user) {
                req.currentUser = user;
                delete req.body.token;
                next();
            } else {
                res.json(sendError('invalid_token'));
            }
        }
    } else {
        res.json(sendError('no_token_sent'));
    }
};