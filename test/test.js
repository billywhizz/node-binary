var sys = require("sys");
var binary = require("../lib/binary");
var assert = require("assert");

var buff = new Buffer(136);
var bin = new binary.Binary();

function getSize(message) {
	var len = 0;
	message.forEach(function(field) {
		if(field.int16 != null) {
			len += 2;
		}
		if(field.int32 != null) {
			len += 4;
		}
		if(field.int != null) {
			len++;
		}
		if(field.string != null) {
			len += field.string.length;
		}
	});
	return len;
}

var record = [
	{"int": 0},
	{"int": 1},
	{"int": 255},
	{"int16": 0},
	{"int16": 1},
	{"int16": 255},
	{"int16": 256},
	{"int16": 65535},
	{"int32": 0},
	{"int32": 128},
	{"int32": 65535},
	{"string": "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"},
	{"int32": 65536},
	{"string": "goodbye"}
];

function unpack(buff) {
	var tmp = bin.unpack("ooonnnnnNNNs100Ns7", 0, buff);
	return [
		{"int": tmp[0]},
		{"int": tmp[1]},
		{"int": tmp[2]},
		{"int16": tmp[3]},
		{"int16": tmp[4]},
		{"int16": tmp[5]},
		{"int16": tmp[6]},
		{"int16": tmp[7]},
		{"int32": tmp[8]},
		{"int32": tmp[9]},
		{"int32": tmp[10]},
		{"string": tmp[11]},
		{"int32": tmp[12]},
		{"string": tmp[13]}
	];
}

size = bin.pack(record, buff, 0);
assert.equal(size, getSize(record));
buff = buff.slice(0, size);
sys.puts(sys.inspect(record, true, 100));
sys.puts(sys.inspect(unpack(buff), true, 100));
assert.deepEqual(record, unpack(buff));